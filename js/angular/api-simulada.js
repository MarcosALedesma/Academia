var ApiSimulada = (function () {

    /* ------------------------------------------------------------------------
     * Catálogo
     * ---------------------------------------------------------------------- */

    var CATEGORIAS = [
        { slug: 'beauty', nombre: 'Beauty', emoji: '💄', tono: 330, precio: [5, 20], marcas: ['Essence', 'Glamour Beauty', 'Velvet Touch'],
          productos: ['Essence Mascara Lash Princess', 'Eyeshadow Palette with Mirror', 'Powder Canister', 'Red Lipstick', 'Red Nail Polish'] },
        { slug: 'fragrances', nombre: 'Fragrances', emoji: '🧴', tono: 280, precio: [10, 130], marcas: ['Calvin Klein', 'Chanel', 'Dior', 'Gucci'],
          productos: ['Calvin Klein CK One', 'Chanel Coco Noir Eau De', "Dior J'adore", 'Dolce Shine Eau de', 'Gucci Bloom Eau de'] },
        { slug: 'furniture', nombre: 'Furniture', emoji: '🛋️', tono: 30, precio: [40, 1500], marcas: ['Annibale Colombo', 'Knoll', 'Nordic Home'],
          productos: ['Annibale Colombo Bed', 'Annibale Colombo Sofa', 'Bedside Table African Cherry', 'Knoll Saarinen Executive Conference Chair', 'Wooden Bathroom Vanity'] },
        { slug: 'groceries', nombre: 'Groceries', emoji: '🛒', tono: 120, precio: [1, 25], marcas: ['Fresh Market', 'Campo Verde', 'Nescafe'],
          productos: ['Apple', 'Beef Steak', 'Cat Food', 'Chicken Meat', 'Cooking Oil', 'Cucumber', 'Dog Food', 'Eggs', 'Fish Steak', 'Green Bell Pepper',
                      'Green Chili Pepper', 'Honey Jar', 'Ice Cream', 'Juice', 'Kiwi', 'Lemon', 'Milk', 'Mulberry', 'Nescafe Coffee', 'Potatoes',
                      'Protein Powder', 'Red Onions', 'Rice', 'Soft Drink', 'Strawberry', 'Tissue Paper Box', 'Water'] },
        { slug: 'home-decoration', nombre: 'Home Decoration', emoji: '🏠', tono: 45, precio: [15, 100], marcas: ['Casa Bella', 'Decor Studio'],
          productos: ['Decoration Swing', 'Family Tree Photo Frame', 'House Showpiece Plant', 'Plant Pot', 'Table Lamp'] },
        { slug: 'kitchen-accessories', nombre: 'Kitchen Accessories', emoji: '🍳', tono: 15, precio: [1, 60], marcas: ['Cocina Pro', 'Chef Line'],
          productos: ['Bamboo Spatula', 'Black Aluminium Cup', 'Chopping Board', 'Citrus Squeezer Yellow', 'Egg Slicer', 'Electric Stove', 'Fine Mesh Strainer', 'Fork', 'Glass',
                      'Grater Black', 'Hand Blender', 'Ice Cube Tray', 'Kitchen Knife Set', 'Knife', 'Lunch Box', 'Microwave Oven', 'Mug Tree Stand'] },
        { slug: 'laptops', nombre: 'Laptops', emoji: '💻', tono: 210, precio: [900, 2500], marcas: ['Apple', 'Asus', 'Huawei', 'Lenovo', 'Dell'],
          productos: ['Apple MacBook Pro 14 Inch Space Grey', 'Asus Zenbook Pro Dual Screen Laptop', 'Huawei Matebook X Pro', 'Lenovo Yoga 920', 'New DELL XPS 13 9300 Laptop', 'Acer Aspire 5 Slim'] },
        { slug: 'mens-shirts', nombre: 'Mens Shirts', emoji: '👔', tono: 200, precio: [15, 60], marcas: ['Urban Fit', 'Gigabyte', 'Classic Man'],
          productos: ['Blue & Black Check Shirt', 'Gigabyte Aorus Men Tshirt', 'Man Plaid Shirt', 'Man Short Sleeve Shirt', 'Men Check Shirt'] },
        { slug: 'mens-shoes', nombre: 'Mens Shoes', emoji: '👞', tono: 25, precio: [60, 200], marcas: ['Nike', 'Puma', 'Off White'],
          productos: ['Nike Air Jordan 1 Retro High', 'Nike Baseball Cleats', 'Puma Future Rider Trainers', 'Sports Sneakers Off White & Red', 'Sports Sneakers Off White Red'] },
        { slug: 'mens-watches', nombre: 'Mens Watches', emoji: '⌚', tono: 50, precio: [50, 15000], marcas: ['Rolex', 'Longines', 'Casio'],
          productos: ['Brown Leather Belt Watch', 'Longines Master Collection', 'Rolex Submariner Watch', 'Rolex Cellini Moonphase', 'Rolex Datejust', 'Casio G-Shock Classic'] },
        { slug: 'mobile-accessories', nombre: 'Mobile Accessories', emoji: '🎧', tono: 180, precio: [10, 400], marcas: ['Apple', 'Amazon', 'Beats', 'Generic'],
          productos: ['Amazon Echo Plus', 'Apple Airpods', 'Apple AirPods Max Silver', 'Apple Charger', 'Apple HomePod Mini Cosmic Grey', 'Apple MagSafe Battery Pack',
                      'Beats Flex Wireless Earbuds', 'Monopod', 'Selfie Stick', 'Phone Tripod', 'Phone Holder', 'Phone Cooling Fan', 'Phone Case Silicone', 'Apple Watch Series 4 Gold'] },
        { slug: 'motorcycle', nombre: 'Motorcycle', emoji: '🏍️', tono: 0, precio: [3000, 15000], marcas: ['Kawasaki', 'Generic Motors', 'Ducati'],
          productos: ['Generic Motorcycle', 'Kawasaki Z800', 'MotoGP CI.H1', 'Scooter Motorcycle', 'Sportbike Motorcycle'] },
        { slug: 'skin-care', nombre: 'Skin Care', emoji: '🧼', tono: 300, precio: [5, 40], marcas: ['Olay', 'Vaseline', 'Neutrogena', 'Cetaphil'],
          productos: ['Attitude Super Leaves Hand Soap', 'Olay Ultra Moisture Body Wash', 'Vaseline Men Face Lotion', 'Neutrogena Hydro Boost Gel', 'Cetaphil Gentle Cleanser'] },
        { slug: 'smartphones', nombre: 'Smartphones', emoji: '📱', tono: 250, precio: [150, 1500], marcas: ['Apple', 'Oppo', 'Realme', 'Samsung', 'Vivo'],
          productos: ['iPhone 5s', 'iPhone 6', 'iPhone 13 Pro', 'iPhone X', 'Oppo A57', 'Oppo F19 Pro Plus', 'Oppo K1', 'Realme C35', 'Realme X', 'Realme XT',
                      'Samsung Galaxy S7', 'Samsung Galaxy S8', 'Samsung Galaxy S10', 'Vivo S1', 'Vivo V9', 'Vivo X21'] },
        { slug: 'sports-accessories', nombre: 'Sports Accessories', emoji: '⚽', tono: 100, precio: [5, 50], marcas: ['Wilson', 'Spalding', 'Adidas'],
          productos: ['American Football', 'Baseball Ball', 'Baseball Bat', 'Baseball Glove', 'Basketball', 'Basketball Rim', 'Cricket Ball', 'Cricket Bat', 'Cricket Helmet',
                      'Cricket Wicket', 'Football', 'Golf Ball', 'Soccer Ball', 'Tennis Ball', 'Tennis Racket', 'Volleyball', 'Yoga Mat'] },
        { slug: 'sunglasses', nombre: 'Sunglasses', emoji: '🕶️', tono: 60, precio: [20, 100], marcas: ['Ray Sun', 'Solaris', 'Vista'],
          productos: ['Black Sun Glasses', 'Classic Sun Glasses', 'Green and Black Glasses', 'Party Glasses', 'Sunglasses', 'Wayfarer Sunglasses'] },
        { slug: 'tablets', nombre: 'Tablets', emoji: '📲', tono: 230, precio: [200, 1200], marcas: ['Apple', 'Samsung', 'Huawei', 'Lenovo'],
          productos: ['iPad Mini 2021 Starlight', 'Samsung Galaxy Tab S8 Plus', 'Samsung Galaxy Tab White', 'Huawei MatePad Pro', 'Lenovo Tab M10', 'Xiaomi Pad 5'] },
        { slug: 'tops', nombre: 'Tops', emoji: '👚', tono: 340, precio: [15, 50], marcas: ['Urban Fit', 'Bella Moda'],
          productos: ['Blue Frock', 'Gray Top Blouse', 'Off Shoulder Top', 'Long Sleeve Crop Top', 'Striped Tunic Top', 'Linen Summer Top'] },
        { slug: 'vehicle', nombre: 'Vehicle', emoji: '🚗', tono: 5, precio: [15000, 45000], marcas: ['Chrysler', 'Dodge', 'Ford'],
          productos: ['300 Touring', 'Charger SXT RWD', 'Dodge Hornet GT Plus', 'Durango SXT RWD', 'Ford Mustang GT', 'Jeep Wrangler Sport'] },
        { slug: 'womens-bags', nombre: 'Womens Bags', emoji: '👜', tono: 320, precio: [30, 500], marcas: ['Prada', 'Heshe', 'Bella Moda'],
          productos: ["Blue Women's Handbag", "Heshe Women's Leather Bag", 'Prada Women Bag', 'White Faux Leather Backpack', 'Women Handbag Black', 'Canvas Tote Bag'] },
        { slug: 'womens-dresses', nombre: 'Womens Dresses', emoji: '👗', tono: 350, precio: [30, 200], marcas: ['Marni', 'Bella Moda', 'Elegance'],
          productos: ["Black Women's Gown", 'Corset Leather With Skirt', 'Corset With Black Skirt', 'Dress Pea', 'Marni Red & Black Suit'] },
        { slug: 'womens-jewellery', nombre: 'Womens Jewellery', emoji: '💍', tono: 290, precio: [10, 100], marcas: ['Brilliance', 'Perla Fina'],
          productos: ['Green Crystal Earring', 'Green Oval Earring', 'Tropical Earring', 'Pearl Necklace', 'Silver Cuff Bracelet'] },
        { slug: 'womens-shoes', nombre: 'Womens Shoes', emoji: '👠', tono: 10, precio: [40, 150], marcas: ['Calvin Klein', 'Pampi', 'Golden Steps'],
          productos: ['Black & Brown Slipper', 'Calvin Klein Heel Shoes', 'Golden Shoes Woman', 'Pampi Shoes', 'Red Shoes'] },
        { slug: 'womens-watches', nombre: 'Womens Watches', emoji: '⌚', tono: 40, precio: [50, 9000], marcas: ['Rolex', 'IWC', 'Casio'],
          productos: ['IWC Ingenieur Automatic Steel', 'Rolex Cellini Date Black Dial', 'Rolex Datejust Ladies', 'Watch Gold for Women', "Women's Wrist Watch", 'Ladies Dress Watch'] }
    ];

    function semilla(n) {
        var t = n + 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    function miniatura(categoria, indice) {
        var tono = (categoria.tono + indice * 7) % 360;
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">' +
                  '<rect width="240" height="240" fill="hsl(' + tono + ',55%,88%)"/>' +
                  '<text x="120" y="142" font-size="96" text-anchor="middle">' + categoria.emoji + '</text></svg>';
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    function construir() {
        var lista = [], id = 0;
        CATEGORIAS.forEach(function (c) {
            c.productos.forEach(function (titulo, i) {
                id++;
                var a = semilla(id * 3 + 1), b = semilla(id * 3 + 2), d = semilla(id * 3 + 3);
                var precio = Math.round((c.precio[0] + a * (c.precio[1] - c.precio[0])) * 100) / 100;
                var imagen = miniatura(c, i);
                lista.push({
                    id: id,
                    title: titulo,
                    description: titulo + ' de la categoría ' + c.nombre + '.',
                    category: c.slug,
                    price: precio,
                    discountPercentage: Math.round((1 + b * 19) * 100) / 100,
                    rating: Math.round((3.5 + d * 1.5) * 100) / 100,
                    stock: 5 + Math.floor(semilla(id * 7) * 95),
                    tags: [c.slug.split('-')[0]],
                    brand: c.marcas[i % c.marcas.length],
                    sku: c.slug.slice(0, 3).toUpperCase() + '-' + String(id).padStart(4, '0'),
                    thumbnail: imagen,
                    images: [imagen]
                });
            });
        });
        return lista;
    }

    var PRODUCTOS = construir();

    /* ------------------------------------------------------------------------
     * Respuestas
     * ---------------------------------------------------------------------- */

    function numero(valor, porDefecto) {
        var n = parseInt(valor, 10);
        return isNaN(n) || n < 0 ? porDefecto : n;
    }

    function ordenar(lista, campo, sentido) {
        if (!campo || !lista.length || !(campo in lista[0])) return lista;
        var f = sentido === 'desc' ? -1 : 1;
        return lista.slice().sort(function (x, y) {
            var a = x[campo], b = y[campo];
            if (typeof a === 'string') return f * a.localeCompare(b);
            return f * (a - b);
        });
    }

    function paginar(base, u) {
        var limite = numero(u.searchParams.get('limit'), 30);
        var salto = numero(u.searchParams.get('skip'), 0);
        var ordenada = ordenar(base, u.searchParams.get('sortBy'), u.searchParams.get('order'));
        var pagina = limite === 0 ? ordenada.slice(salto) : ordenada.slice(salto, salto + limite);
        return { products: pagina, total: base.length, skip: salto, limit: limite === 0 ? base.length : limite };
    }

    function resolver(texto) {
        var u;
        try { u = new URL(texto); } catch (e) { return { red: true }; }
        if (u.hostname !== 'dummyjson.com') return { red: true };

        var partes = u.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
        if (partes[0] !== 'products') return { estado: 404, cuerpo: { message: 'Not Found' } };

        if (partes.length === 1) return { estado: 200, cuerpo: paginar(PRODUCTOS, u) };

        if (partes[1] === 'search' && partes.length === 2) {
            var q = (u.searchParams.get('q') || '').toLowerCase();
            var coinciden = PRODUCTOS.filter(function (p) { return p.title.toLowerCase().indexOf(q) !== -1; });
            return { estado: 200, cuerpo: paginar(coinciden, u) };
        }
        if (partes[1] === 'categories' && partes.length === 2) {
            return { estado: 200, cuerpo: CATEGORIAS.map(function (c) {
                return { slug: c.slug, name: c.nombre, url: 'https://dummyjson.com/products/category/' + c.slug };
            }) };
        }
        if (partes[1] === 'category-list' && partes.length === 2) {
            return { estado: 200, cuerpo: CATEGORIAS.map(function (c) { return c.slug; }) };
        }
        if (partes[1] === 'category' && partes.length === 3) {
            var deLaCategoria = PRODUCTOS.filter(function (p) { return p.category === partes[2]; });
            return { estado: 200, cuerpo: paginar(deLaCategoria, u) };
        }
        if (partes.length === 2 && /^\d+$/.test(partes[1])) {
            var uno = PRODUCTOS.filter(function (p) { return p.id === parseInt(partes[1], 10); })[0];
            return uno ? { estado: 200, cuerpo: uno }
                       : { estado: 404, cuerpo: { message: "Product with id '" + partes[1] + "' not found" } };
        }
        return { estado: 404, cuerpo: { message: 'Not Found' } };
    }

    /* ------------------------------------------------------------------------
     * Backend de HttpClient
     * ---------------------------------------------------------------------- */

    var TEXTOS = { 404: 'Not Found', 500: 'Internal Server Error' };

    function crearBackend(A) {
        var estado = { red: 'normal', pedidos: [] };
        var HttpResponse = A.http.HttpResponse;
        var HttpErrorResponse = A.http.HttpErrorResponse;

        function demora() { return estado.red === 'lenta' ? 2500 : 350; }

        return {
            estado: estado,
            reiniciarPedidos: function () { estado.pedidos = []; },
            handle: function (req) {
                return new A.rxjs.Observable(function (observador) {
                    var url = req.urlWithParams;
                    estado.pedidos.push(url);
                    var respuesta = resolver(url);
                    var reloj = setTimeout(function () {
                        if (estado.red === 'caida' || respuesta.red) {
                            observador.error(new HttpErrorResponse({
                                url: url, status: 0, statusText: 'Unknown Error', error: new ProgressEvent('error')
                            }));
                        } else if (respuesta.estado !== 200) {
                            observador.error(new HttpErrorResponse({
                                url: url, status: respuesta.estado, statusText: TEXTOS[respuesta.estado] || 'Error', error: respuesta.cuerpo
                            }));
                        } else {
                            observador.next(new HttpResponse({ url: url, status: 200, statusText: 'OK', body: respuesta.cuerpo }));
                            observador.complete();
                        }
                    }, demora());
                    return function () { clearTimeout(reloj); };
                });
            }
        };
    }

    return { productos: PRODUCTOS, categorias: CATEGORIAS, resolver: resolver, crearBackend: crearBackend };
})();

if (typeof module !== 'undefined') module.exports = ApiSimulada;
