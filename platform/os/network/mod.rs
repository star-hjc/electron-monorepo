pub mod error;
mod types;

#[cfg(windows)]
mod windows;
#[cfg(windows)]
pub use windows::Network;

// #[cfg(target_os = "macos")]
