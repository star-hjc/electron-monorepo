// swift-tools-version:5.5.0
import PackageDescription

let package = Package(
    name: "MySwiftLib",
    products: [
        .library(name: "MySwiftLib", type: .dynamic, targets: ["MySwiftLib"]),
    ],
    targets: [
        .target(name: "MySwiftLib"),
    ]
)
