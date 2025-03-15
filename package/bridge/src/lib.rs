use neon::prelude::*;
use rdev::{listen, EventType};
use std::{sync::Arc, thread, time::UNIX_EPOCH};

use libloading::{Library, Symbol};
use std::env;
use std::fs;

fn call_case(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let callback = cx.argument::<JsFunction>(0)?;
    let callback = Arc::new(callback.root(&mut cx));
    let channel = cx.channel();
    thread::spawn(move || {
        if let Err(error) = listen(move |event| {
            let callback = Arc::clone(&callback);
            channel.send(move |mut cx| {
                let name = event.name.unwrap_or_default();
                let time = event.time.duration_since(UNIX_EPOCH).unwrap_or_default();
                let time = time.as_millis() as f64;
                let obj = cx.empty_object();
                match event.event_type {
                    EventType::KeyPress(key) => {
                        let value = cx.string("KeyPress");
                        let key = cx.string(format!("{:?}", key));
                        obj.set(&mut cx, "type", value)?;
                        let arg = cx.empty_array();
                        arg.set(&mut cx, 0, key)?;
                        obj.set(&mut cx, "arg", arg)?;
                    }
                    EventType::KeyRelease(key) => {
                        let value = cx.string("KeyRelease");
                        let key = cx.string(format!("{:?}", key));
                        obj.set(&mut cx, "type", value)?;
                        let arg = cx.empty_array();
                        arg.set(&mut cx, 0, key)?;
                        obj.set(&mut cx, "arg", arg)?;
                    }
                    EventType::ButtonPress(button) => {
                        let value = cx.string("ButtonPress");
                        let button = cx.string(format!("{:?}", button));
                        obj.set(&mut cx, "type", value)?;
                        let arg = cx.empty_array();
                        arg.set(&mut cx, 0, button)?;
                        obj.set(&mut cx, "arg", arg)?;
                    }
                    EventType::ButtonRelease(button) => {
                        let value = cx.string("ButtonRelease");
                        let button = cx.string(format!("{:?}", button));
                        obj.set(&mut cx, "type", value)?;
                        let arg = cx.empty_array();
                        arg.set(&mut cx, 0, button)?;
                        obj.set(&mut cx, "arg", arg)?;
                    }
                    EventType::MouseMove { x, y } => {
                        let value = cx.string("MouseMove");
                        let x = cx.number(x as f64);
                        let y = cx.number(y as f64);
                        obj.set(&mut cx, "type", value)?;
                        let arg = cx.empty_array();
                        arg.set(&mut cx, 0, x)?;
                        arg.set(&mut cx, 1, y)?;
                        obj.set(&mut cx, "arg", arg)?;
                    }
                    EventType::Wheel { delta_x, delta_y } => {
                        let value = cx.string("Wheel");
                        let delta_x = cx.number(delta_x as f64);
                        let delta_y = cx.number(delta_y as f64);
                        obj.set(&mut cx, "type", value)?;
                        let arg = cx.empty_array();
                        arg.set(&mut cx, 0, delta_x)?;
                        arg.set(&mut cx, 1, delta_y)?;
                        obj.set(&mut cx, "arg", arg)?;
                    }
                };
                let args = vec![obj.upcast(), cx.string(name).upcast(), cx.number(time).upcast()];
                let callback = callback.to_inner(&mut cx);
                let this = cx.undefined().clone();
                callback.call(&mut cx, this, args)?;
                Ok(())
            });
        }) {
            println!("Error: {:?}", error)
        }
    });
    Ok(cx.undefined())
}

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello"))
}

fn get_dylib_absolute_path(dylib_name: &str) -> String {
    // 获取当前工作目录
    let current_dir = env::current_dir().expect("Failed to get current directory");

    // 构建基础路径：向上两级，然后进入目标目录
    let base_path = current_dir.join("../../platform/macos/NativeLibrary/.build/release");

    // 拼接完整的动态库文件名（自动添加.dylib后缀）
    let dylib_filename = format!("{}.dylib", dylib_name);
    let relative_lib_path = base_path.join(dylib_filename);

    // 转换为绝对路径
    let absolute_lib_path = fs::canonicalize(&relative_lib_path).expect("Failed to resolve absolute path");

    // 将PathBuf转换为String
    absolute_lib_path.to_str().expect("Path contains invalid UTF-8 characters").to_string()
}

fn sum(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let a = cx.argument::<JsNumber>(0)?.value(&mut cx) as i32;
    let b = cx.argument::<JsNumber>(1)?.value(&mut cx) as i32;

    let absolute_lib_path = get_dylib_absolute_path("libMySwiftLib");

    // 加载 `.dylib`
    let result = unsafe {
        let lib = Library::new(absolute_lib_path).expect("Failed to load Swift dynamic library");
        let sum_fn: Symbol<unsafe extern "C" fn(i32, i32) -> i32> = lib.get(b"add").expect("Failed to find function sum");

        sum_fn(a, b)
    };

    Ok(cx.number(result as f64))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("callCase", call_case)?;
    cx.export_function("hello", hello)?;
    cx.export_function("sum", sum)?;
    Ok(())
}
