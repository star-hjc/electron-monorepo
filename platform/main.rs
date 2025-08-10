mod os;
use std::{thread, time::Duration};

use os::network::Network;

fn main() {
    Network::observer(|status| {
        println!("Network status changed :{:?}", status);
    })
    .unwrap_or_else(|err| {
        println!("Network::observer err:{:?}", err);
        ()
    });

    loop {
        thread::sleep(Duration::from_secs(1));
    }
}
