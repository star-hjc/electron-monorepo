use js_sys::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    fn error(s: &str);
}

#[wasm_bindgen]
pub fn md5(data: JsValue) -> JsValue {
    let data: String = JsString::from(data).into();
    let digest = md5::compute(data.as_bytes());
    let hex: JsString = JsString::from(format!("{:x}", digest).as_str());
    JsValue::from(JsString::from(hex))
}

#[wasm_bindgen(start)]
pub fn run() {
    log("start");
}
