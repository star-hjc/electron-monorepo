// 使用 @_cdecl 导出 C 风格的函数符号
@_cdecl("sayHello")
public func sayHello() {
    print("Hello from Swift dylib!")
}

@_cdecl("addNumbers")
public func addNumbers(a: Int32, b: Int32) -> Int32 {
    return a + b
}