use super::error::{NetworkError, NetworkResult};
use num_derive::FromPrimitive;
use num_traits::FromPrimitive;
use std::{
    collections::VecDeque,
    net::{IpAddr, Ipv4Addr, Ipv6Addr},
};
use uuid::Uuid;

#[cfg(target_os = "macos")]
use core_foundation::{base::TCFType, string::CFString};

/// IANA 接口类型 (ifType) 的 Rust 枚举表示
/// 参考: https://www.iana.org/assignments/ianaiftype-mib/ianaiftype-mib
#[derive(Debug, Default, FromPrimitive, Clone, Copy, PartialEq, Eq)]
#[repr(u32)]
pub enum ifType {
    #[default]
    Unknown = 0,
    /// 1 - 一些其他类型的网络接口
    Other = 1,
    /// 6 - 以太网网络接口
    Ethernet = 6,
    /// 9 - 令牌环网络接口
    TokenRing = 9,
    /// 23 - PPP 网络接口
    Ppp = 23,
    /// 24 - 软件环回网络接口
    SoftwareLoopback = 24,
    /// 37 - ATM 网络接口
    Atm = 37,
    /// 71 - IEEE 802.11 无线网络接口
    Ieee80211 = 71,
    /// 131 - 隧道类型封装网络接口
    Tunnel = 131,
    /// 144 - IEEE 1394 (Firewire) 高性能串行总线网络接口
    Ieee1394 = 144,
    /// 215 - 6to4 interface (DEPRECATED)
    SixToFour = 215,
    /// 243 - 3GPP WWAN (4G/LTE/5G)
    WwanPP = 243,
    /// 244 - 3GPP2 WWAN (CDMA/EV-DO)
    WwanPP2 = 244,
    /// 300 - CPRI (通用公共无线电接口，用于基站前传)
    Cpri = 300,
}

impl TryFrom<u32> for ifType {
    type Error = NetworkError;

    fn try_from(value: u32) -> Result<Self, Self::Error> {
        FromPrimitive::from_u32(value).ok_or_else(|| NetworkError::Internal(format!("Invalid ifType value: {}", value)))
    }
}

#[cfg(target_os = "macos")]
impl TryFrom<*const core_foundation::string::__CFString> for ifType {
    type Error = NetworkError;

    fn try_from(value: *const core_foundation::string::__CFString) -> Result<Self, Self::Error> {
        if value.is_null() {
            return Err(NetworkError::MacOs("ifType try_from, value is null ptr".to_string()));
        }
        let value = unsafe { CFString::wrap_under_get_rule(value) };
        match value.to_string().as_str() {
            "" => Err(NetworkError::MacOs("ifType try_from, value is empty".to_string())),
            "Type6to4" => Ok(ifType::SixToFour),
            "Ethernet" => Ok(ifType::Ethernet),
            "IEEE80211" => Ok(ifType::Ieee80211),
            "FireWire" => {
                println!("macos ifType FireWire");
                Ok(ifType::Ieee1394)
            }
            "WWAN" => {
                println!("macos ifType WwanPP、WwanPP2");
                Ok(ifType::WwanPP)
            }
            other => {
                println!("Unsupported ifType value {}.", other);
                Ok(ifType::Unknown)
            }
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NetworkType {
    Wired,
    Wifi,
    Cellular,
    Unknown,
}

#[derive(Debug, Clone, PartialEq)]
pub struct NetworkStatus {
    pub id: String,
    #[cfg(target_os = "windows")]
    pub adapter_id: Uuid,
    #[cfg(target_os = "macos")]
    pub adapter_id: String,
    pub name: String,
    pub network_type: NetworkType,
    pub ipv4: Option<Ipv4Addr>,
    pub ipv6: Option<Ipv6Addr>,
    pub status: ConnectionStatus,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ConnectionStatus {
    Connected,
    Disconnected,
}

impl ifType {
    pub fn is_wireless(&self) -> bool {
        matches!(self, ifType::Ieee80211)
    }

    pub fn is_wired(&self) -> bool {
        matches!(self, ifType::Ethernet | ifType::Ieee1394)
    }

    pub fn is_cellular(&self) -> bool {
        matches!(
            self,
            ifType::WwanPP |   // 3GPP (LTE/5G)
            ifType::WwanPP2 |   // 3GPP2 (CDMA)
            ifType::Cpri // 基站无线接口
        )
    }

    pub fn network_type(&self) -> NetworkType {
        if self.is_wireless() {
            NetworkType::Wifi
        } else if self.is_wired() {
            NetworkType::Wired
        } else if self.is_cellular() {
            NetworkType::Cellular
        } else {
            NetworkType::Unknown
        }
    }
}

#[derive(Default, FromPrimitive, Debug, Clone, Copy)]
pub enum IfOperStatus {
    StatusUp = 1,
    Down = 2,
    Testing = 3,
    #[default]
    Unknown = 4,
    Dormant = 5,
    NotPresent = 6,
    LowerLayerDown = 7,
}

impl TryFrom<i32> for IfOperStatus {
    type Error = NetworkError;

    fn try_from(value: i32) -> Result<Self, Self::Error> {
        FromPrimitive::from_i32(value).ok_or_else(|| NetworkError::Internal(format!("Invalid IfOperStatus value: {}", value)))
    }
}

#[derive(Debug, Clone)]
pub struct IpAdapterAddresses {
    #[cfg(target_os = "windows")]
    pub id: Uuid,
    pub interface_name: String,
    pub ipv4: Option<Ipv4Addr>,
    pub ipv6: Option<Ipv6Addr>,
    #[cfg(target_os = "windows")]
    pub gateway: VecDeque<IpAddr>,
    #[cfg(target_os = "windows")]
    pub if_type: ifType,
    #[cfg(target_os = "windows")]
    pub oper_status: Option<IfOperStatus>,
}

impl Default for IpAdapterAddresses {
    fn default() -> Self {
        Self {
            #[cfg(target_os = "windows")]
            id: Default::default(),
            interface_name: Default::default(),
            ipv4: Default::default(),
            ipv6: Default::default(),
            #[cfg(target_os = "windows")]
            gateway: Default::default(),
            #[cfg(target_os = "windows")]
            if_type: Default::default(),
            #[cfg(target_os = "windows")]
            oper_status: Default::default(),
        }
    }
}

pub trait NetworkAdapter {
    fn observer<F>(callback: F) -> NetworkResult<()>
    where
        F: Fn() -> () + Send + Sync + 'static;

    fn get_network_status_list() -> NetworkResult<Vec<NetworkStatus>>;
}
