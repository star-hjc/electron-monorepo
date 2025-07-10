use std::fs;
use std::path::Path;

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

#[cfg(not(debug_assertions))]
fn load_env() {
    println!("cargo:warning=ENV {:?}", std::env::var("ENV"));
    let env = std::env::var("ENV").unwrap_or_else(|err| {
        println!("cargo:warning=ENV not set, defaulting to .env. err:{:?}", err);
        "development".to_string()
    });
    let env_name = format!(".env.{}", env);
    // load the .env file
    for item in dotenv::dotenv_iter().expect("Failed to load .env file") {
        let (key, value) = item.unwrap_or_else(|err| panic!("{:?}", err));
        println!("cargo:rustc-env={}={}", key, value);
    }
    // load the .env.<ENV> file
    for item in dotenv::from_filename_iter(&env_name).expect(&format!("Failed to load {} file", env_name)) {
        let (key, value) = item.unwrap_or_else(|err| panic!("{:?}", err));
        println!("cargo:rustc-env={}={}", key, value);
    }
}

fn main() {
    #[cfg(not(debug_assertions))]
    load_env();
    let demo_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let out_dir = std::env::var("OUT_DIR").unwrap();
    let target_dir = Path::new(&out_dir).ancestors().nth(3).unwrap();
    load_dylib(demo_dir, target_dir)
}
