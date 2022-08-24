import { products } from "./products.js";

const cartBtn = document.querySelector(".cart-btn");
const productsDOM = document.querySelector(".products-container");
const backdrop = document.querySelector(".backdrop");
const cartModal = document.querySelector(".cart");
const cartItems = document.querySelector(".cart-items");

const cartContent = document.querySelector(".cart-content");
const cartTotal = document.querySelector(".cart-total");
const clearCartBtn = document.querySelector(".clear-cart");
const closeCartModal = document.querySelector(".close");


let cart = [];

let buttonsDOM = [];

// get products 
class Products {
    getProducts() {
        return products;
    }
}

// Display products
class UI {
    displayProducts(products) {
        let result = "";
        products.forEach((product) => {
            result += `
            <div class="product">
            <div class="product-img">
                <img src="${product.image}">
            </div>

            <div class="add-to-cart product-icons" data-id="${product.id}">
            <i class="fas fa-search product-icon"></i>
            <i class="fa fa-shopping-cart product-icon"></i>
            </div>

            <div class="product-desc">
                <p class="product-title">${product.title}</p>
                <p class="product-price">$${product.price}</p>
            </div>
        </div>`
        });

        productsDOM.innerHTML = result;
    }

    getCartBtns() {
        const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
        buttonsDOM = addToCartBtns;
        addToCartBtns.forEach((btn) => {
            let id = btn.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                btn.innerText = "In cart";
                btn.disabled = true;
            }
            else {
                btn.addEventListener("click", (event) => {

                    /* we target the grand parent of add to cart icon 
                        because we want change the content of parent only 
                        by clicking on cart  
                    */
                    const addBtn = event.target.parentElement;
                    const productIcons = addBtn;
                    productIcons.innerText = "In cart";

                    productIcons.classList.add("in-cart");
                    event.target.disabled = true;

                    // -1 get product from products
                    const cartItems = { ...Storage.getProduct(id), quantity: 1 }

                    // -2 add product to cart 
                    cart = [...cart, cartItems];
                    //-3 save the cart in local storage 
                    Storage.saveCart(cart);
                    //-4 set cart values 
                    this.setCartValues(cart);
                    //-5 display cart items 
                    this.addCartItem(cartItems);

                });
            }
        });
    }
    setCartValues(cart) {
        let tempCartItems = 0;
        const totalPrice = cart.reduce((acc, curr) => {
            tempCartItems += curr.quantity;
            return curr.quantity * curr.price + acc;
        }, 0);

        cartTotal.innerText = `total price : ${parseFloat(totalPrice).toFixed(2)} $`;
        cartItems.innerText = tempCartItems;
    }
    addCartItem(cart) {
        const div = document.createElement("div");
        div.classList.add("cart-center");
        div.innerHTML = `
        <div>
        <img src="${cart.image}" class="cart-item-img">
        </div> 
        <div class="cart-item-desc">
        <h4>${cart.title}</h4>
        <h5>${cart.price} $</h5>
        </div>
    <div class="cart-item-controller">
        <i class="fas fa-chevron-up" data-id=${cart.id}></i>
        <p class="item-quantity">${cart.quantity}</p>
        <i class="fas fa-chevron-down" data-id=${cart.id}></i>
    </div>
    <i class="fas fa-trash remove-item" data-id=${cart.id}></i>
    </div>`

        cartContent.appendChild(div);
    }

    setupApp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
    }

    populateCart(cart) {
        cart.forEach((item) => this.addCartItem(item));
    }

    cartLogic() {
        clearCartBtn.addEventListener("click", () => {
            /*in this example we use this with arrow function
            because inherit it from the parent scope,in this case it will
            return UI  */
            this.clearCart();
        });
        // update item quantity
        cartContent.addEventListener("click", event => {
            if (event.target.classList.contains('remove-item')) {
                const removeItem = event.target;
                const id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement);
                this.removeItem(id);
            }

            else if (event.target.classList.contains('fa-chevron-up')) {
                const addAmount = event.target;
                const id = addAmount.dataset.id;
                const tempItem = cart.find(item => item.id == id);
                tempItem.quantity++;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerHTML = tempItem.quantity;
            }
            else if (event.target.classList.contains('fa-chevron-down')) {
                const subAmount = event.target;
                const id = subAmount.dataset.id;
                const tempItem = cart.find(item => item.id == id);
                console.log(tempItem);
                tempItem.quantity--;
                if (tempItem.quantity > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    subAmount.previousElementSibling.innerHTML = tempItem.quantity;
                }
            }
        });
    }

    clearCart() {
        // loop on all the item and trigger remove for each one
        cart.forEach((item) => this.removeItem(item.id));
        console.log(cartContent.children[0]);
        while (cartContent.children.length) {
            cartContent.removeChild(cartContent.children[0]);
        }
        closeCart();
    }

    removeItem(id) {
        // reusable method for single remove and clear all
        cart = cart.filter((cartItem) => cartItem.id != id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        const button = this.getSingleButton(id);
        button.disabled = false;
        button.classList.remove("in-cart");

        button.innerHTML = `
        <i class="fas fa-search product-icon"></i>
        <i class="fa fa-shopping-cart product-icon"></i>`;


    }
    getSingleButton(id) {
        // should be parseInt to get correct result
        return buttonsDOM.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
    }
}

//Local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        const products = JSON.parse(localStorage.getItem("products"));
        return products.find((product) => product.id == id)
    }


    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse
            (localStorage.getItem('cart')) : []
    }
}


// Get all products
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    // setup app
    ui.setupApp();
    const products = new Products();


    const productsData = products.getProducts();
    // console.table(productsData);
    ui.displayProducts(productsData);
    ui.getCartBtns();
    ui.cartLogic();
    Storage.saveProducts(productsData);

});


//Show the cart
function showCart() {
    backdrop.style.display = "block";
    cartModal.style.opacity = "1";
    cartModal.style.top = "30%";

}

function closeCart() {
    backdrop.style.display = "none";
    cartModal.style.opacity = "0";
    cartModal.style.top = "-100%";
}
cartBtn.addEventListener("click", showCart);
closeCartModal.addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);



//Toggle nav
const toggleNav = document.querySelector(".toggle-nav");
const links = document.querySelector(".links");

toggleNav.addEventListener("click", () => {
    links.classList.toggle('show');

});




