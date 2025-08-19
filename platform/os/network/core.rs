use std::{collections::HashMap, sync::MutexGuard};

use crate::os::network::{
    error::{NetworkError, NetworkResult},
    types::{ConnectionStatus, NetworkAdapter, NetworkStatus},
};

#[cfg(target_os = "macos")]
use super::macos::{Adapter, NETWORK_MONITOR};

#[cfg(target_os = "windows")]
use super::windows::{Adapter, NETWORK_MONITOR};

pub struct Network;

impl Network {
    pub fn observer<F>(callback: F) -> NetworkResult<()>
    where
        F: Fn(NetworkStatus) + Send + Sync + Clone + 'static,
    {
        let mut network = Self::get()?;
        *network = Self::list()?;
        drop(network);
        println!("start:{:?}", Self::list());

        Adapter::observer(move || {
            let cb = callback.clone();
            Self::diff(move |status| {
                cb(status);
            })
            .unwrap();
        })
        .unwrap();
        Ok(())
    }

    fn get() -> NetworkResult<MutexGuard<'static, Vec<NetworkStatus>>> {
        let monitor = &*NETWORK_MONITOR;
        monitor
            .lock()
            .map_err(|err| NetworkError::Internal(format!("NETWORK_MONITOR lock failed: {}", err)))
    }

    fn diff<F>(callback: F) -> NetworkResult<()>
    where
        F: Fn(NetworkStatus) + Send + Sync + 'static,
    {
        let network = Self::list()?;
        let mut guard = Self::get()?;

        let old_map: HashMap<String, &NetworkStatus> = guard.iter().map(|n| (n.id.clone(), n)).collect();
        // 处理新增或修改的状态
        for new_net in &network {
            match old_map.get(&new_net.id) {
                Some(old_net)
                    if old_net != &new_net
                        && !(matches!(old_net.status, ConnectionStatus::Disconnected)
                            && matches!(new_net.status, ConnectionStatus::Disconnected)) =>
                {
                    println!(
                        "网卡状态变化: ID={}, status={:?} old_status={:?}",
                        new_net.id, new_net.status, old_net.status
                    );
                    callback(new_net.clone());
                    break;
                }
                None if matches!(new_net.status, ConnectionStatus::Connected) => {
                    println!("新增网卡 (已连接): ID={}, Name={}", new_net.id, new_net.name);
                    callback(new_net.clone());
                }
                _ => (),
            }
        }

        // 处理被移除的状态
        for old_net in guard.iter() {
            if !network.iter().any(|n| n.id == old_net.id) {
                let mut disconnected = old_net.clone();
                disconnected.status = ConnectionStatus::Disconnected;
                println!("网卡已移除: ID={}, Name={}", old_net.id, old_net.name);
                callback(disconnected);
            }
        }

        // 更新状态存储
        *guard = network;

        Ok(())
    }

    fn is_connected() -> NetworkResult<bool> {
        let network_list = Self::get()?;
        for item in &*network_list {
            if matches!(item.status, ConnectionStatus::Connected) {
                return Ok(true);
            }
        }
        return Ok(false);
    }

    pub fn list() -> NetworkResult<Vec<NetworkStatus>> {
        Adapter::get_network_status_list()
    }
}
