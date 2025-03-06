use std::{sync::Arc, thread, time::UNIX_EPOCH};
use rdev::{listen,EventType};
use neon::prelude::*;

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
        let args = vec![
          obj.upcast(),
          cx.string(name).upcast(),
          cx.number(time).upcast(),
        ];
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


#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
  cx.export_function("callCase", call_case)?;
  cx.export_function("hello", hello)?;
  Ok(())
}
