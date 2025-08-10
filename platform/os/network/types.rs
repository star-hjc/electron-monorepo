use super::error::NetworkError;
use num_derive::FromPrimitive;
use num_traits::FromPrimitive;
use std::{
    collections::VecDeque,
    net::{IpAddr, Ipv4Addr, Ipv6Addr},
};
use uuid::Uuid;

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
    pub adapter_id: Uuid,
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
        matches!(self, ifType::Ethernet)
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
    pub id: Uuid,
    pub friendly_name: String,
    pub ipv4: Option<Ipv4Addr>,
    pub ipv6: Option<Ipv6Addr>,
    pub gateway: VecDeque<IpAddr>,
    pub if_type: ifType,
    pub oper_status: Option<IfOperStatus>,
}

impl IpAdapterAddresses {
    pub fn friendly_name(&self) -> &str {
        &self.friendly_name
    }
}

impl Default for IpAdapterAddresses {
    fn default() -> Self {
        Self {
            id: Default::default(),
            friendly_name: Default::default(),
            ipv4: Default::default(),
            ipv6: Default::default(),
            gateway: Default::default(),
            if_type: Default::default(),
            oper_status: Default::default(),
        }
    }
}
