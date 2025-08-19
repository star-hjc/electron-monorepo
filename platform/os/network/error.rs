use std::{fmt, result};

pub type NetworkResult<T> = result::Result<T, NetworkError>;

#[derive(Debug)]
pub enum NetworkError {
    Io(std::io::Error),
    Uuid(uuid::Error),
    FromUtf8(std::string::FromUtf8Error),
    Internal(String),
    #[cfg(target_os = "windows")]
    WinOs(windows::core::Error),
    #[cfg(target_os = "macos")]
    MacOs(String),
}

impl fmt::Display for NetworkError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            NetworkError::Io(error) => write!(f, "IO error: {:?}", error),
            NetworkError::Internal(error) => write!(f, "Internal error: {}", error),
            NetworkError::FromUtf8(error) => write!(f, "FromUtf8 error: {:?}", error),
            NetworkError::Uuid(error) => write!(f, "Uuid error: {:?}", error),
            #[cfg(target_os = "windows")]
            NetworkError::WinOs(error) => write!(f, "WinOs error: {}", error),
            #[cfg(target_os = "macos")]
            NetworkError::MacOs(error) => write!(f, "MacOs error: {}", error),
        }
    }
}
