use crate::os::network::types::{ConnectionStatus, IfOperStatus, IpAdapterAddresses, NetworkAdapter, NetworkStatus, ifType};
use std::{
    collections::HashMap,
    net::{IpAddr, Ipv4Addr, Ipv6Addr},
    sync::{Arc, LazyLock, Mutex, MutexGuard},
};
use uuid::Uuid;
use windows::{
    Networking::Connectivity::{NetworkConnectivityLevel, NetworkInformation, NetworkStatusChangedEventHandler},
    Win32::{
        NetworkManagement::IpHelper::{self, GetAdaptersAddresses, IP_ADAPTER_ADDRESSES_LH},
        Networking::WinSock::{AF_UNSPEC, SOCKADDR, SOCKADDR_IN, SOCKADDR_IN6},
    },
};

use super::error::{NetworkError, NetworkResult};

pub(super) static NETWORK_MONITOR: LazyLock<Arc<Mutex<Vec<NetworkStatus>>>> = LazyLock::new(|| Arc::new(Mutex::new(Vec::new())));

pub(super) struct Adapter {
    _buffer: Vec<u8>,
    current: Option<*mut IP_ADAPTER_ADDRESSES_LH>,
}

impl NetworkAdapter for Adapter {
    fn observer<F>(callback: F) -> NetworkResult<()>
    where
        F: Fn() + Send + Sync + 'static,
    {
        let handler = NetworkStatusChangedEventHandler::new(move |_| Ok(callback()));
        NetworkInformation::NetworkStatusChanged(&handler).map_err(|err| NetworkError::WinOs(err))?;
        Ok(())
    }

    fn get_network_status_list() -> NetworkResult<Vec<NetworkStatus>> {
        let profiles = NetworkInformation::GetConnectionProfiles().map_err(NetworkError::WinOs)?;
        let mut network_status = vec![];
        let adapter_list = Adapter::list()?;
        for profile in profiles {
            let adapter = profile.NetworkAdapter().map_err(NetworkError::WinOs)?;
            let adapter_id = adapter.NetworkAdapterId().map_err(NetworkError::WinOs)?;
            let adapter_id = Uuid::from_u128(adapter_id.to_u128());
            let name = profile.ProfileName().map(|v| v.to_string()).unwrap_or_default();
            let status = if profile.GetNetworkConnectivityLevel().unwrap_or_default() == NetworkConnectivityLevel::InternetAccess {
                ConnectionStatus::Connected
            } else {
                ConnectionStatus::Disconnected
            };
            let network_type = ifType::try_from(adapter.IanaInterfaceType().map_err(NetworkError::WinOs)?)?.network_type();
            let adapter_item = adapter_list.iter().find(|v| v.id == adapter_id);
            let ipv4 = adapter_item.and_then(|v| v.ipv4);
            let ipv6 = adapter_item.and_then(|v| v.ipv6);
            let id = format!("{:X}", md5::compute(format!("{}{}", adapter_id.to_string(), name)));
            network_status.push(NetworkStatus {
                id,
                adapter_id,
                name,
                network_type,
                ipv4,
                ipv6,
                status,
            });
        }
        Ok(network_status)
    }
}

impl Adapter {
    fn new() -> NetworkResult<Adapter> {
        let family = AF_UNSPEC.0 as u32;
        let flags = IpHelper::GAA_FLAG_INCLUDE_PREFIX;
        let mut size: u32 = 0;

        let result = unsafe { GetAdaptersAddresses(family, flags, Some(std::ptr::null_mut()), Some(std::ptr::null_mut()), &mut size) };
        if result != 111 {
            return Err(NetworkError::Internal(format!("First call failed with error code: {}", result)));
        }

        let mut _buffer: Vec<u8> = Vec::with_capacity(size as usize);
        let adapter_addresses = _buffer.as_mut_ptr() as *mut IP_ADAPTER_ADDRESSES_LH;

        let result = unsafe { GetAdaptersAddresses(family, flags, Some(std::ptr::null_mut()), Some(adapter_addresses), &mut size) };
        if result != 0 {
            return Err(NetworkError::Internal(format!("Second call failed with error code: {}", result)));
        }
        Ok(Self {
            _buffer,
            current: Some(adapter_addresses),
        })
    }

    fn list() -> NetworkResult<Vec<IpAdapterAddresses>> {
        let adapter = Self::new()?;
        let mut adapter_list: Vec<IpAdapterAddresses> = vec![];
        for item in adapter {
            adapter_list.push(item);
        }
        Ok(adapter_list)
    }

    fn by_id(adapter_id: Uuid) -> NetworkResult<Option<IpAdapterAddresses>> {
        let adapter = Self::new()?;
        for adapter in adapter {
            if adapter_id == adapter.id {
                return Ok(Some(adapter));
            }
        }
        Ok(None)
    }

    fn get_sockaddr_ip(sockaddr: &SOCKADDR) -> Option<IpAddr> {
        match sockaddr.sa_family.0 {
            23 => {
                let sa = unsafe { &*(sockaddr as *const SOCKADDR as *const SOCKADDR_IN6) };
                Some(IpAddr::V6(Ipv6Addr::from(unsafe { sa.sin6_addr.u.Byte })))
            }
            2 => {
                let sa = unsafe { &*(sockaddr as *const SOCKADDR as *const SOCKADDR_IN) };
                let addr = unsafe { sa.sin_addr.S_un.S_un_b };
                Some(IpAddr::V4(Ipv4Addr::new(addr.s_b1, addr.s_b2, addr.s_b3, addr.s_b4)))
            }
            other => {
                println!("Unknown address family: {}", other);
                None
            }
        }
    }
}

// impl Drop for Adapter {
//     fn drop(&mut self) {
//         todo!()
//     }
// }

impl Iterator for Adapter {
    type Item = IpAdapterAddresses;

    fn next(&mut self) -> Option<Self::Item> {
        if let Some(current) = self.current {
            if current.is_null() {
                return None;
            }
            let mut item = IpAdapterAddresses::default();
            let adapter = unsafe { &*current };
            let adapter_id_result = unsafe { adapter.AdapterName.to_string() }.map_err(NetworkError::FromUtf8).and_then(|s| {
                s.strip_prefix('{')
                    .and_then(|s| s.strip_suffix('}'))
                    .map(|s| s.to_string())
                    .ok_or(NetworkError::Internal("Invalid adapter name format".to_string()))
            });
            let adapter_id_str = match adapter_id_result {
                Ok(v) => v,
                Err(err) => {
                    eprintln!("Adapter next, AdapterName to string err:{:?}", err);
                    return None;
                }
            };
            item.id = match Uuid::parse_str(adapter_id_str.as_str()) {
                Ok(v) => v,
                Err(err) => {
                    eprintln!("Adapter next, adapter_id to Uuid err:{:?}", err);
                    return None;
                }
            };
            item.interface_name = unsafe { adapter.FriendlyName.to_string() }.unwrap_or(String::new());
            item.if_type = ifType::try_from(adapter.IfType).unwrap_or_default();
            item.oper_status = Some(IfOperStatus::try_from(adapter.OperStatus.0).unwrap_or_default());
            let mut unicast_address = adapter.FirstUnicastAddress;
            while !unicast_address.is_null() {
                let unicast = unsafe { &*unicast_address };
                let sockaddr = unsafe { &*unicast.Address.lpSockaddr };
                match Self::get_sockaddr_ip(sockaddr) {
                    Some(IpAddr::V6(ip)) => item.ipv6 = Some(ip),
                    Some(IpAddr::V4(ip)) => item.ipv4 = Some(ip),
                    None => continue,
                }
                unicast_address = unicast.Next;
            }
            let mut gateway_address = adapter.FirstDnsServerAddress;
            while !gateway_address.is_null() {
                let gateway = unsafe { &*gateway_address };
                let sockaddr = unsafe { &*gateway.Address.lpSockaddr };
                match Self::get_sockaddr_ip(sockaddr) {
                    Some(IpAddr::V6(ip)) => item.gateway.push_back(IpAddr::V6(ip)),
                    Some(IpAddr::V4(ip)) => item.gateway.push_front(IpAddr::V4(ip)),
                    None => continue,
                }
                gateway_address = gateway.Next
            }
            self.current = Some(adapter.Next);
            Some(item)
        } else {
            None
        }
    }
}
