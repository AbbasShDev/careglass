const client = contentful.createClient({
	// This is the space ID. A space is like a project folder in Contentful terms
	space: 'kvhkhf5ok65c',
	// This is the access token for this space. Normally you get both ID and the token in the Contentful web app
	accessToken: 'lT1rpgWzgbrmijDQiBoGgZt83IDlN9V39uNMi4bZXYY'
});

// custom Notiflix
Notiflix.Notify.Init({
	success: {
		background: '#efecea',
		textColor: '#334854',
		notiflixIconColor: '#334854'
	}
});

Notiflix.Confirm.Init({
	titleColor: '#334854',
	okButtonBackground: '#334854'
});

Notiflix.Report.Init({
	info: {
		buttonBackground: '#334854',
		svgColor: '#334854'
	}
});
//variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDOM = document.querySelector('.products-center');
const checkoutBtn = document.querySelector('.check-out');

//cart
let cart = [];

// btnDOM
let bottonsDOM = [];

//getting the products
class Products {
	async getProdects() {
		try {
			let contentful = await client.getEntries({
				content_type: 'careglassProducts'
			});

			let products = contentful.items;
			products = products.map((item) => {
				const { title, price } = item.fields;
				const { id } = item.sys;
				const image = item.fields.image.fields.file.url;
				return { title, price, id, image };
			});
			return products;
		} catch (error) {
			console.log(error);
		}
	}
}

//displaying the products
class UI {
	dispalyProducts(products) {
		let result = '';
		products.forEach((product) => {
			result += `
            <!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="prudct1" class="product-img">
                    <button class="bag-btn" data-id=${product.id}><i class="fas fa-shopping-cart"></i>add to cart</button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!-- end of single product -->
            `;
		});
		productDOM.innerHTML = result;
	}
	getBagButtons() {
		let buttons = [ ...document.querySelectorAll('.bag-btn') ];
		bottonsDOM = buttons;
		buttons.forEach((button) => {
			let id = button.dataset.id;
			let inCart = cart.find((item) => item.id === id);

			if (inCart) {
				button.innerText = 'In Cart';
				button.disabled = true;
			} else {
				button.addEventListener('click', (event) => {
					event.target.innerText = 'In Cart';
					event.target.disabled = true;
					// get product from products
					let cartItem = { ...Storage.getProduct(id), amount: 1 };
					//adding the product to the cart
					cart = [ ...cart, cartItem ];
					//save cart in local storage
					Storage.saveCart(cart);
					//seting the cart values
					this.setCartValues(cart);
					// display cart item
					this.addCartItem(cartItem);
					// // show the cart
					// this.showCart();
					Notiflix.Notify.Success(`${cartItem.title} successfully added to cart.`);
				});
			}
		});
	}
	setCartValues(cart) {
		let tempTotal = 0;
		let itemsTotal = 0;
		cart.map((item) => {
			tempTotal += item.price * item.amount;
			itemsTotal += item.amount;
		});
		cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
		cartItems.innerText = itemsTotal;
	}
	addCartItem(item) {
		const div = document.createElement('div');
		div.classList.add('cart-item');
		div.innerHTML = `
        <img src=${item.image} alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>
        `;
		cartContent.appendChild(div);
	}
	showCart() {
		cartOverlay.classList.add('transparentBcg');
		cartDOM.classList.add('showCart');
	}
	setupAPP() {
		cart = Storage.getCart();
		this.setCartValues(cart);
		this.papulateCart(cart);
		cartBtn.addEventListener('click', this.showCart);
		closeCartBtn.addEventListener('click', this.hideCart);
	}
	papulateCart(cart) {
		cart.forEach((item) => this.addCartItem(item));
	}
	hideCart() {
		cartOverlay.classList.remove('transparentBcg');
		cartDOM.classList.remove('showCart');
	}
	cartLogic() {
		// clear cart btn
		clearCartBtn.addEventListener('click', () => {
			let currentCart = Storage.getCart();
			if (currentCart.length > 0) {
				Notiflix.Confirm.Show('Confirmation', 'Do you really want to clear your cart?', 'Yes', 'No', () => {
					// Yes button callback
					this.clearCart();
				});
			} else {
				Notiflix.Report.Info('Empty!', 'Your cart is empty.', 'OK');
			}
		});
		checkoutBtn.addEventListener('click', () => {
			let currentCart = Storage.getCart();
			if (currentCart.length > 0) {
				Notiflix.Confirm.Show(
					'Confirmation',
					`Your total is $ ${cartTotal.innerText}`,
					`pay now`,
					'Cancel',
					() => {
						// Yes button callback
						Notiflix.Report.Success(
							'Thank you for your order!',
							`Your order number: ${parseInt(Math.random() * 1e9)}`,
							'OK'
						);
						this.clearCart();
					}
				);
			} else {
				Notiflix.Report.Info('Ops!!!', 'Your cart is empty!', 'OK');
			}
		});
		// inside cart functionality
		cartContent.addEventListener('click', (e) => {
			if (e.target.classList.contains('remove-item')) {
				let removeItem = e.target;
				let id = removeItem.dataset.id;
				let tempItem = cart.find((item) => item.id === id);
				Notiflix.Confirm.Show(
					'Confirmation',
					`Do you really want to remove ${tempItem.title} from your cart?`,
					'Yes',
					'No',
					() => {
						// Yes button callback
						cartContent.removeChild(removeItem.parentElement.parentElement);
						this.removeItem(id);
					}
				);
			} else if (e.target.classList.contains('fa-chevron-up')) {
				let addAmount = e.target;
				let id = addAmount.dataset.id;
				let tempItem = cart.find((item) => item.id === id);
				tempItem.amount = tempItem.amount + 1;
				Storage.saveCart(cart);
				this.setCartValues(cart);
				addAmount.nextElementSibling.innerText = tempItem.amount;
			} else if (e.target.classList.contains('fa-chevron-down')) {
				let lowerAmount = e.target;
				let id = lowerAmount.dataset.id;
				let tempItem = cart.find((item) => item.id === id);
				tempItem.amount = tempItem.amount - 1;
				if (tempItem.amount > 0) {
					Storage.saveCart(cart);
					this.setCartValues(cart);
					lowerAmount.previousElementSibling.innerText = tempItem.amount;
				} else {
					Notiflix.Confirm.Show(
						'Confirmation',
						`Do you really want to remove ${tempItem.title} from your cart?`,
						'Yes',
						'No',
						() => {
							cartContent.removeChild(lowerAmount.parentElement.parentElement);
							this.removeItem(id);
						}
					);
				}
			}
		});
	}
	clearCart() {
		let cartItem = cart.map((item) => item.id);
		cartItem.forEach((id) => this.removeItem(id));

		while (cartContent.children.length > 0) {
			cartContent.removeChild(cartContent.children[0]);
		}
		this.hideCart();
	}
	removeItem(id) {
		let item = cart.find((item) => item.id === id);
		cart = cart.filter((item) => item.id !== id);
		this.setCartValues(cart);
		Storage.saveCart(cart);
		let button = this.getSingleButton(id);
		button.disabled = false;
		button.innerHTML = `
        <i class="fas fa-shopping-cart"></i>add to cart
        `;

		Notiflix.Notify.Success(`${item.title} successfully removed from the cart.`);
	}
	getSingleButton(id) {
		return bottonsDOM.find((button) => button.dataset.id === id);
	}
}

//local storge
class Storage {
	static saveProducts(products) {
		localStorage.setItem('products', JSON.stringify(products));
	}
	static getProduct(id) {
		let products = JSON.parse(localStorage.getItem('products'));
		return products.find((product) => product.id == id);
	}
	static saveCart(cart) {
		localStorage.setItem('cart', JSON.stringify(cart));
	}
	static getCart() {
		return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
	}
}

document.addEventListener('DOMContentLoaded', () => {
	let products = new Products();
	let ui = new UI();

	//set app
	ui.setupAPP();
	//getting all the data
	products
		.getProdects()
		.then((products) => {
			ui.dispalyProducts(products);
			Storage.saveProducts(products);
		})
		.then(() => {
			ui.getBagButtons();
			ui.cartLogic();
		});
});
