use std::fs;
use std::path::Path;
use std::{collections::HashSet, env};

#[cfg(target_os = "windows")]
fn load_dylib(demo_dir: String, target_dir: &Path) {
    let dll_source = Path::new(&demo_dir).join("src/libs/");
    if let Ok(entries) = fs::read_dir(&dll_source) {
        for entry in entries {
            if let Ok(entry) = entry {
                let file_path = entry.path();
                if file_path.is_file() {
                    let file_name = file_path.file_name().unwrap();
                    let target_path = target_dir.join(file_name);
                    if let Err(e) = fs::copy(&file_path, &target_path) {
                        eprintln!("Failed to copy {}: {}", file_path.display(), e);
                    } else {
                        println!("Copied {} to {}", file_path.display(), target_path.display());
                    }
                }
            }
        }
    } else {
        eprintln!("Failed to read directory: {}", dll_source.display());
    }
    println!("cargo:rustc-link-search={}", target_dir.display());
    println!("cargo:rustc-link-lib=dylib=create_dll");
}

#[cfg(target_os = "macos")]
fn load_dylib(demo_dir: String, target_dir: &Path) {
    // todo!()
}

fn load_env() {
    let initial_vars: HashSet<String> = env::vars().map(|(key, _)| key).collect();
    dotenv::from_filename(format!(".env{}", env::args().nth(1).unwrap_or_default())).ok();
    for (key, value) in env::vars() {
        if !initial_vars.contains(&key) {
            println!("cargo:rustc-env={}={}", key, value);
        }
    }
}

fn main() {
    load_env();

    let demo_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let out_dir = std::env::var("OUT_DIR").unwrap();
    let target_dir = Path::new(&out_dir).ancestors().nth(3).unwrap();
    load_dylib(demo_dir, target_dir)
}
