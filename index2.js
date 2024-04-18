import * as THREE from 'three';

// Инициализация сцены, камеры и рендерера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20; // Убедитесь, что камера достаточно далеко, чтобы видеть объекты

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Добавление направленного света
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

// Функция для создания сферы с обводкой
function createSphereWithOutline(x, y, z) {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Яркий цвет для лучшей видимости
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);

    const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
    outlineMesh.scale.multiplyScalar(1.05); // Чуть больше основной сферы
    sphere.add(outlineMesh);

    scene.add(sphere);
    return sphere;
}

// Функция для создания линии между двумя точками
function connectSpheres(sphere1, sphere2) {
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const points = [sphere1.position.clone(), sphere2.position.clone()];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
}

// Создание объектов
const sphere1 = createSphereWithOutline(0, 0, 0);
const sphere2 = createSphereWithOutline(5, 5, 5);
connectSpheres(sphere1, sphere2);

// Функция анимации
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
