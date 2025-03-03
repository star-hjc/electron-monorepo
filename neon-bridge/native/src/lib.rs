use neon::prelude::*;
use libloading::{Library,Symbol};
// use std::env;
// use std::path::PathBuf;

// fn get_executable_dir() -> Result<PathBuf, Box<dyn std::error::Error>> {
//     let exe_path = env::current_exe()?;
//     exe_path.parent()
//         .ok_or("无法获取可执行文件目录".into())
//         .map(|p| p.to_path_buf())
// }

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello node"))
}

fn run_dylib_func(mut cx: FunctionContext)-> JsResult<JsString> {
    // 加载动态库
    unsafe {
        // TODO:使用相对路径拼接
        // let mut lib_path = get_executable_dir();
        // lib_path.push("../../../platform/macos/libHello.dylib");
        let lib = Library::new("../platform/macos/libHello.dylib").expect("Failed to load library");
        let add_numbers: Symbol<unsafe extern "C" fn(i32, i32) -> i32> =
            lib.get(b"addNumbers").expect("Symbol not found");
        let result = add_numbers(5, 3);
        println!("5 + 3 = {}", result); // 输出: 5 + 3 = 8
    }
    Ok(cx.string("hello node"))
}


register_module!(mut cx, {
    cx.export_function("hello", hello);
    cx.export_function("run_dylib_func",run_dylib_func)
});
