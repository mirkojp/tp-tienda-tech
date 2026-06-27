// seed.js
const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337/api';

const BRANDS = [
    { name: 'Apple' },
    { name: 'Samsung' },
    { name: 'Logitech' }
];

const CATEGORIES = [
    { name: 'Celulares' },
    { name: 'Audio' },
    { name: 'Accesorios' },
    { name: 'Computación' }
];

const PRODUCTS = [
    // --- APPLE ---
    {
        title: 'iPhone 15 Pro',
        description: 'Chip A17 Pro, carcasa de titanio y cámara de 48 MPX con zoom óptico.',
        price: 1199.99,
        discountPrice: 1099.99,
        stock: 8,
        brandName: 'Apple',
        categoryName: 'Celulares'
    },
    {
        title: 'MacBook Air M3',
        description: 'Pantalla Liquid Retina de 13.6 pulgadas, 8GB de RAM y 256GB SSD. Ultra delgada y silenciosa.',
        price: 1099.00,
        discountPrice: null,
        stock: 5,
        brandName: 'Apple',
        categoryName: 'Computación'
    },
    {
        title: 'iPad Air M2',
        description: 'Pantalla Liquid Retina de 11 pulgadas, ideal para diseño gráfico y productividad con Apple Pencil.',
        price: 599.00,
        discountPrice: 549.99,
        stock: 10,
        brandName: 'Apple',
        categoryName: 'Computación'
    },
    {
        title: 'AirPods Pro 2da Gen',
        description: 'Cancelación activa de ruido inteligente, audio espacial personalizado y estuche de carga MagSafe USB-C.',
        price: 249.00,
        discountPrice: 229.00,
        stock: 25,
        brandName: 'Apple',
        categoryName: 'Audio'
    },
    {
        title: 'Apple Watch Series 9',
        description: 'Caja de aluminio con correa deportiva. Monitoreo avanzado de oxígeno en sangre y sensor de temperatura.',
        price: 399.99,
        discountPrice: null,
        stock: 7,
        brandName: 'Apple',
        categoryName: 'Accesorios'
    },
    {
        title: 'Cargador MagSafe Apple',
        description: 'Alineación magnética perfecta para una carga inalámbrica rápida y segura de hasta 15W.',
        price: 39.00,
        discountPrice: 35.00,
        stock: 40,
        brandName: 'Apple',
        categoryName: 'Accesorios'
    },
    {
        title: 'AirPods Max',
        description: 'Auriculares circumaurales con diadema de malla tejida transpirable y transductor dinámico diseñado por Apple.',
        price: 549.00,
        discountPrice: 499.00,
        stock: 4,
        brandName: 'Apple',
        categoryName: 'Audio'
    },

    // --- SAMSUNG ---
    {
        title: 'Galaxy S24 Ultra',
        description: 'Pantalla Dynamic AMOLED 2X, S-Pen integrado, estructura de titanio e Inteligencia Artificial integrada (Galaxy AI).',
        price: 1299.99,
        discountPrice: null,
        stock: 12,
        brandName: 'Samsung',
        categoryName: 'Celulares'
    },
    {
        title: 'Galaxy Z Fold5',
        description: 'El smartphone plegable definitivo. Pantalla principal de 7.6 pulgadas para multitarea masiva.',
        price: 1799.99,
        discountPrice: 1599.99,
        stock: 3,
        brandName: 'Samsung',
        categoryName: 'Celulares'
    },
    {
        title: 'Monitor Odyssey Neo G9',
        description: 'Monitor curvo de 49 pulgadas súper ultra-wide mini-LED, tasa de refresco de 240Hz y 1ms de respuesta.',
        price: 1499.00,
        discountPrice: null,
        stock: 4,
        brandName: 'Samsung',
        categoryName: 'Computación'
    },
    {
        title: 'Galaxy Buds3 Pro',
        description: 'Cancelación de ruido adaptativa por IA, diseño ergonómico y sonido premium de alta fidelidad.',
        price: 249.99,
        discountPrice: 199.99,
        stock: 20,
        brandName: 'Samsung',
        categoryName: 'Audio'
    },
    {
        title: 'Galaxy Tab S9 Ultra',
        description: 'Pantalla AMOLED de 14.6 pulgadas, resistencia al agua IP68 y rendimiento extremo para gaming y edición.',
        price: 999.00,
        discountPrice: 899.00,
        stock: 6,
        brandName: 'Samsung',
        categoryName: 'Computación'
    },
    {
        title: 'Parlante Samsung Sound Tower',
        description: 'Sonido bidireccional de alta potencia de 160 vatios, luces LED rítmicas de fiesta y panel resistente al agua.',
        price: 299.99,
        discountPrice: null,
        stock: 10,
        brandName: 'Samsung',
        categoryName: 'Audio'
    },
    {
        title: 'SSD Externo Samsung T7 1TB',
        description: 'Unidad de estado sólido portátil con velocidades de lectura de hasta 1050 MB/s y protección con contraseña.',
        price: 119.99,
        discountPrice: 99.99,
        stock: 30,
        brandName: 'Samsung',
        categoryName: 'Accesorios'
    },

    // --- LOGITECH ---
    {
        title: 'Mouse G Pro X Superlight',
        description: 'Mouse inalámbrico de precisión ultra liviano (menos de 63 gramos) para esports profesionales.',
        price: 150.00,
        discountPrice: null,
        stock: 15,
        brandName: 'Logitech',
        categoryName: 'Accesorios'
    },
    {
        title: 'Teclado Mecánico G915 TKL',
        description: 'Teclado inalámbrico Lightspeed con switches mecánicos de perfil bajo y retroiluminación RGB LIGHTSYNC.',
        price: 229.99,
        discountPrice: 189.99,
        stock: 5,
        brandName: 'Logitech',
        categoryName: 'Accesorios'
    },
    {
        title: 'Auriculares Logitech G733 K/DA',
        description: 'Auriculares inalámbricos con diadema con suspensión ajustable y tecnología de micrófono Blue VO!CE.',
        price: 149.99,
        discountPrice: 135.00,
        stock: 18,
        brandName: 'Logitech',
        categoryName: 'Audio'
    },
    {
        title: 'Mouse Ergonómico MX Master 3S',
        description: 'Diseño anatómico avanzado para productividad, rueda de desplazamiento MagSpeed y sensor de 8000 DPI sobre vidrio.',
        price: 99.99,
        discountPrice: null,
        stock: 22,
        brandName: 'Logitech',
        categoryName: 'Accesorios'
    },
    {
        title: 'Cámara Web Logitech Brio 4K',
        description: 'Cámara web premium para streaming y videollamadas en Ultra HD con encuadre automático por IA y HDR.',
        price: 199.00,
        discountPrice: 169.99,
        stock: 14,
        brandName: 'Logitech',
        categoryName: 'Accesorios'
    },
    {
        title: 'Parlantes Logitech Z407',
        description: 'Sistema de altavoces Bluetooth 2.1 con subwoofer y control dial inalámbrico para escritorio.',
        price: 119.99,
        discountPrice: null,
        stock: 11,
        brandName: 'Logitech',
        categoryName: 'Audio'
    },
    {
        title: 'Volante Logitech G29 Driving Force',
        description: 'Volante de carreras con Force Feedback para PS5, PS4 y PC con pedalera de acero inoxidable incluida.',
        price: 299.00,
        discountPrice: 279.99,
        stock: 6,
        brandName: 'Logitech',
        categoryName: 'Accesorios'
    }
];

async function main() {
    console.log('🚀 Iniciando megaseeding compatible con Media Library en Strapi v5...');

    const brandMap = {};
    const categoryMap = {};

    try {
        // console.log('\n📦 Creando marcas...');
        // for (const brand of BRANDS) {
        //     const response = await axios.post(`${STRAPI_URL}/brands`, { data: brand });
        //     const docId = response.data.data.documentId;
        //     brandMap[brand.name] = docId;
        //     console.log(`   Marca: ${brand.name} (${docId})`);
        // }

        // console.log('\n📦 Creando categorías...');
        // for (const category of CATEGORIES) {
        //     const response = await axios.post(`${STRAPI_URL}/categories`, { data: category });
        //     const docId = response.data.data.documentId;
        //     categoryMap[category.name] = docId;
        //     console.log(`   Categoría: ${category.name} (${docId})`);
        // }

        console.log('\n📦 Cargando base de productos masiva...');
        let contador = 0;
        for (const prod of PRODUCTS) {
            const brandDocId = brandMap[prod.brandName];
            const categoryDocId = categoryMap[prod.categoryName];

            const productPayload = {
                data: {
                    title: prod.title,
                    description: prod.description,
                    price: prod.price,
                    discountPrice: prod.discountPrice,
                    stock: prod.stock,
                    isDeleted: false,
                    brand: brandDocId || null,
                    category: categoryDocId || null
                    // Omitimos 'images' para dejar que la Media Library acepte el registro limpio
                }
            };

            await axios.post(`${STRAPI_URL}/products`, productPayload);
            contador++;
            console.log(`   [${contador}/21] ✅ ${prod.title} registrado con éxito.`);
        }

        console.log('\n🎉 ¡Megaseeding finalizado perfectamente!');

    } catch (error) {
        console.error('\n❌ Error durante el seed:', error.response?.data || error.message);
    }
}

main();