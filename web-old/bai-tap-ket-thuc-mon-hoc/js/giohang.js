let totalPrice = 0;

function selectProduct(name, price) {
    document.getElementById('productName').value = name;
    document.getElementById('productPrice').value = price;
}

function addProduct() {
    const productName = document.getElementById('productName').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productQuantity = parseInt(document.getElementById('productQuantity').value);

    if (productName === "" || isNaN(productPrice) || productQuantity <= 0) {
        alert("Vui lòng chọn sản phẩm hợp lệ và nhập số lượng.");
        return;
    }

    const cartItems = document.getElementById('cart-items');
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerText = `${productName} - $${productPrice.toFixed(2)} x ${productQuantity}`;
    cartItems.appendChild(cartItem);

    totalPrice += productPrice * productQuantity;
    document.getElementById('totalPrice').innerText = `Tổng Tiền: $${totalPrice.toFixed(2)}`;

    // Clear input fields
    document.getElementById('productName').value = "";
    document.getElementById('productPrice').value = "";
    document.getElementById('productQuantity').value = 1;
}

function checkout() {
    if (totalPrice === 0) {
        alert("Giỏ hàng của bạn đang trống.");
        return;
    }
    alert(`Thanh toán thành công! Tổng số tiền là $${totalPrice.toFixed(2)}`);
    document.getElementById('cart-items').innerHTML = "";
    totalPrice = 0;
    document.getElementById('totalPrice').innerText = `Tổng Tiền: $0.00`;
}
