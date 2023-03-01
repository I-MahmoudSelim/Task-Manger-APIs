const { calculateTip, fahrenheitToCelsius, celsiusToFahrenheit, add } = require("../src/math")
test("test consvert from f to c", () => {
    const deg = fahrenheitToCelsius(32);
    expect(deg).toBe(0)
})


// beforeAll(() => console.log('1 - beforeAll'));
// afterAll(() => console.log('1 - afterAll'));
// beforeEach(() => console.log('1 - beforeEach'));
// afterEach(() => console.log('1 - afterEach'));
test("convert from c to f", () => {
    const deg = celsiusToFahrenheit(100);
    expect(deg).toBe(212)
})

test("test add function", async () => {
    const resault = await add(12, 13);
    expect(resault).toBe(25);

})

test("test object", () => {
    const data = { one: 1 };
    data["two"] = 4
    expect(data).toStrictEqual({ one: 1, two: 4 })
})

test('null', () => {
    const n = null;
    expect(n).toBeNull();
    expect(n).toBeDefined();
    expect(n).not.toBeUndefined();
    expect(n).not.toBeTruthy();
    expect(n).toBeFalsy();
});

test('zero', () => {
    const z = 0;
    expect(z).not.toBeNull();
    expect(z).toBeDefined();
    expect(z).not.toBeUndefined();
    expect(z).not.toBeTruthy();
    expect(z).toBeFalsy();
});
test('adding floating point numbers', () => {
    const value = 0.1 + 0.2;
    // expect(value).toBe(0.30000000000000004);       //    This won't work because of rounding error
    expect(value).toBeCloseTo(0.3); // This works.
});