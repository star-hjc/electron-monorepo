mod core;
pub mod error;
mod types;

#[cfg(windows)]
mod windows;

#[cfg(target_os = "macos")]
pub(super) mod macos;

pub use core::Network;
