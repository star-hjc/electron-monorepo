use core_foundation::{
    array::{CFArray, CFArrayRef},
    base::{CFRelease, FromVoid, TCFType},
    dictionary::{CFDictionary, CFDictionaryGetKeysAndValues},
    propertylist::CFPropertyListRef,
    runloop::{CFRunLoopAddSource, CFRunLoopGetCurrent, CFRunLoopRun, kCFRunLoopCommonModes},
    string::{CFString, CFStringRef},
};
use libc::{AF_INET, AF_INET6, IFF_BROADCAST, SSLEEP, getifaddrs, ifaddrs, sleep, sockaddr};
use std::{
    ffi::{CStr, c_void},
    net::{IpAddr, Ipv4Addr, Ipv6Addr},
    sync::{Arc, LazyLock, Mutex},
};
use system_configuration::dynamic_store::{SCDynamicStore, SCDynamicStoreBuilder};
use system_configuration_sys::{
    dynamic_store::{
        SCDynamicStoreContext, SCDynamicStoreCopyValue, SCDynamicStoreCreate, SCDynamicStoreCreateRunLoopSource, SCDynamicStoreRef,
        SCDynamicStoreSetNotificationKeys,
    },
    network_configuration::{
        SCNetworkInterfaceCopyAll, SCNetworkInterfaceGetBSDName, SCNetworkInterfaceGetHardwareAddressString, SCNetworkInterfaceGetInterfaceType,
        SCNetworkInterfaceGetLocalizedDisplayName, SCNetworkInterfaceRef, kSCNetworkInterfaceType6to4,
    },
};

use crate::os::network::types::{ConnectionStatus, IpAdapterAddresses, NetworkAdapter, NetworkStatus, NetworkType, ifType};
use crate::os::network::{
    self,
    error::{NetworkError, NetworkResult},
};
use objc2_core_location::CLLocationManager;
use objc2_core_wlan::CWWiFiClient;

pub(super) static NETWORK_MONITOR: LazyLock<Arc<Mutex<Vec<NetworkStatus>>>> = LazyLock::new(|| Arc::new(Mutex::new(Vec::new())));

static NETWORK_CHANGE_CALLBACK: LazyLock<Arc<Mutex<Option<Box<dyn Fn() + Send + Sync + 'static>>>>> = LazyLock::new(|| Arc::new(Mutex::new(None)));

unsafe extern "C" fn network_change_callback(_store: SCDynamicStoreRef, _changed_keys: CFArrayRef, _info: *mut c_void) {
    if let Err(err) = Adapter::call_network_change_callback() {
        eprintln!("call_network_change_callback err:{:?}", err)
    }
}
pub(super) struct Adapter {
    last_adapter_name: Option<String>,
    current: Option<*mut ifaddrs>,
}

impl Adapter {
    fn new() -> NetworkResult<Adapter> {
        let mut ifap: *mut ifaddrs = std::ptr::null_mut();
        if unsafe { getifaddrs(&mut ifap) } != 0 {
            return Err(NetworkError::MacOs("".to_string()));
        }
        Ok(Self {
            current: Some(ifap),
            last_adapter_name: None,
        })
    }

    fn set_network_change_callback<F>(callback: F) -> NetworkResult<()>
    where
        F: Fn() -> () + Send + Sync + 'static,
    {
        let mut cb = NETWORK_CHANGE_CALLBACK
            .lock()
            .map_err(|err| NetworkError::Internal(format!("set_network_change_callback Failed to lock NETWORK_CHANGE_CALLBACK: {:?}", err)))?;
        *cb = Some(Box::new(callback));
        Ok(())
    }

    fn call_network_change_callback() -> NetworkResult<()> {
        let callback = NETWORK_CHANGE_CALLBACK
            .lock()
            .map_err(|err| NetworkError::Internal(format!("call_network_change_callback Failed to lock NETWORK_CHANGE_CALLBACK: {}", err)))?;
        match callback.as_ref() {
            Some(cb) => Ok(cb()),
            None => Err(NetworkError::Internal("No network change callback registered".to_string())),
        }
    }

    fn list() -> NetworkResult<Vec<IpAdapterAddresses>> {
        let adapter = Self::new()?;
        let mut adapter_list: Vec<IpAdapterAddresses> = vec![];
        for item in adapter {
            adapter_list.push(item);
        }
        Ok(adapter_list)
    }

    fn by_name(name: String) -> NetworkResult<Option<IpAdapterAddresses>> {
        let adapter = Self::new()?;
        for adapter in adapter {
            if name == adapter.interface_name {
                return Ok(Some(adapter));
            }
        }
        Ok(None)
    }

    fn get_sockaddr_ip(sockaddr: *mut sockaddr) -> Option<IpAddr> {
        if sockaddr.is_null() {
            return None;
        }
        match (unsafe { *sockaddr }).sa_family as i32 {
            AF_INET => {
                let addr_ptr = sockaddr as *const libc::sockaddr_in;
                Some(IpAddr::from((unsafe { *addr_ptr }).sin_addr.s_addr.to_ne_bytes()))
            }
            AF_INET6 => {
                let addr_ptr = sockaddr as *const libc::sockaddr_in6;
                Some(IpAddr::from((unsafe { *addr_ptr }).sin6_addr.s6_addr))
            }
            _ => None,
        }
    }

    fn get_ssid_name_by_name(name: &str) -> NetworkResult<String> {
        let client = unsafe { CWWiFiClient::new() };
        let interfaces = unsafe { client.interfaces() }
            .ok_or(NetworkError::MacOs("interfaces".to_string()))?
            .to_vec();
        let mut ssid_name = String::new();
        for item in interfaces {
            let interface_name = unsafe { item.interfaceName() }.unwrap_or_default();
            let interface_name = unsafe { CStr::from_ptr(interface_name.UTF8String()).to_str() }
                .map_err(|err| NetworkError::MacOs(format!("interface_name err:{:?}", err)))?;
            if interface_name != name || unsafe { !item.powerOn() } {
                continue;
            }
            println!("{}", unsafe { item.powerOn() });
            let ssid = unsafe { item.ssid() }.unwrap_or_default();
            ssid_name = unsafe { CStr::from_ptr(ssid.UTF8String()).to_str() }
                .map_err(|err| NetworkError::MacOs(format!("ssid_name err:{:?}", err)))?
                .to_string();
            if ssid_name.is_empty() {
                let manager = unsafe { CLLocationManager::new() };
                let status = unsafe { manager.authorizationStatus() };
                println!("Authorization: {:?}", status)
            }
        }
        Ok(ssid_name)
    }
}

impl NetworkAdapter for Adapter {
    fn observer<F>(callback: F) -> NetworkResult<()>
    where
        F: Fn() -> () + Send + Sync + 'static,
    {
        Self::set_network_change_callback(callback)?;
        let mut context = SCDynamicStoreContext {
            version: 0,
            info: std::ptr::null_mut(),
            retain: None,
            release: None,
            copyDescription: None,
        };
        // 2. 创建唯一的名称（如 "com.example.network.watcher"）
        let name = CFString::from_static_string("com.example.network.watcher");

        // 3. 创建 SCDynamicStore 实例
        let store = unsafe { SCDynamicStoreCreate(std::ptr::null(), name.as_concrete_TypeRef(), Some(network_change_callback), &mut context) };

        if store.is_null() {
            return Err(NetworkError::Internal("Failed to create SCDynamicStore!".to_string()));
        }
        // 4. 设置监听的 Key（如 IPv4 状态）
        let keys_to_watch: CFArray<CFString> = CFArray::from_CFTypes(&[
            CFString::from_static_string("State:/Network/Global/IPv4"),
            CFString::from_static_string("State:/Network/Global/IPv6"),
        ]);
        unsafe {
            SCDynamicStoreSetNotificationKeys(store, keys_to_watch.as_concrete_TypeRef(), std::ptr::null());

            // 5. 将 SCDynamicStore 绑定到 RunLoop
            let run_loop_source = SCDynamicStoreCreateRunLoopSource(std::ptr::null(), store, 0);
            CFRunLoopAddSource(CFRunLoopGetCurrent(), run_loop_source, kCFRunLoopCommonModes);
            println!("Starting network monitor... Press Ctrl+C to exit.");
            CFRunLoopRun(); // 进入主事件循环
        }
        Ok(())
    }

    fn get_network_status_list() -> super::error::NetworkResult<Vec<NetworkStatus>> {
        let interfaces = unsafe { SCNetworkInterfaceCopyAll() };
        if interfaces.is_null() {
            return Err(NetworkError::Internal("Failed to get SCNetworkInterfaceCopyAll!".to_string()));
        }
        let mut network_status_list: Vec<NetworkStatus> = vec![];
        let network_interfaces: CFArray<SCNetworkInterfaceRef> = unsafe { CFArray::wrap_under_get_rule(interfaces) };
        let adapter_list = Adapter::list()?;
        for interface in network_interfaces.iter() {
            // kSCNetworkInterfaceTypeBluetooth
            let interface_type: *const core_foundation::string::__CFString = unsafe { SCNetworkInterfaceGetInterfaceType(*interface) };
            let bsd_name = unsafe { SCNetworkInterfaceGetBSDName(*interface) };
            // 2.2 转换为 Rust 字符串
            let interface_name = cfstring_to_string(bsd_name);
            let adapter_item = adapter_list.iter().find(|v| v.interface_name == interface_name);
            let ipv4 = adapter_item.and_then(|v| v.ipv4);
            let ipv6 = adapter_item.and_then(|v| v.ipv6);
            let network_type = ifType::try_from(interface_type)?.network_type();
            let name = if matches!(network_type, NetworkType::Wifi) {
                let ssid = Self::get_ssid_name_by_name(&interface_name)?;
                if ssid.is_empty() { interface_name.clone() } else { ssid }
            } else {
                interface_name.clone()
            };
            let status = if ipv4.is_none() && ipv6.is_none() {
                ConnectionStatus::Disconnected
            } else {
                ConnectionStatus::Connected
            };
            let id = format!("{:X}", md5::compute(&interface_name));
            network_status_list.push(NetworkStatus {
                id,
                adapter_id: interface_name.clone(),
                name,
                network_type,
                ipv4,
                ipv6,
                status,
            });
        }
        unsafe { CFRelease(interfaces as *const c_void) };
        Ok(network_status_list)
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
        let current = self.current?;
        if current.is_null() {
            return None;
        }
        let mut ip_adapter_addresses = IpAdapterAddresses::default();
        let mut next_current = current;
        while !next_current.is_null() {
            let adapter = unsafe { &*next_current };
            let name = unsafe { CStr::from_ptr(adapter.ifa_name).to_string_lossy().into_owned() };
            if let Some(last_adapter_name) = &self.last_adapter_name {
                if last_adapter_name != &name {
                    self.current = Some(next_current);
                    self.last_adapter_name = Some(name.clone());
                    break;
                }
            }
            self.last_adapter_name = Some(name.clone());
            ip_adapter_addresses.interface_name = name;
            match Self::get_sockaddr_ip(adapter.ifa_addr) {
                Some(IpAddr::V4(ip)) => ip_adapter_addresses.ipv4 = Some(ip),
                Some(IpAddr::V6(ip)) => ip_adapter_addresses.ipv6 = Some(ip),
                None => {}
            }
            next_current = adapter.ifa_next;
            if next_current.is_null() {
                self.current = Some(next_current);
            }
        }
        Some(ip_adapter_addresses)
    }
}

fn cfstring_to_string(cf_str: CFStringRef) -> String {
    if cf_str.is_null() {
        return String::new();
    }
    let cf_string: CFString = unsafe { CFString::wrap_under_get_rule(cf_str) };
    cf_string.to_string()
}
