<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
}>();

defineExpose({
    shootGift
});

interface Light {
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
}

interface Building {
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    lights: Light[],
    roofFeature: string
}

interface Snowflake {
    x: number,
    y: number,
    radius: number,
    speed: number,
    z: number,
    nbBranches: number
}

interface Gift {
    x: number,
    y: number,
    width: number,
    height: number,
    speed: number,
    color: string,
    ribbon: string,
    isSpecial: boolean
}

const kaspaLogo = ref<HTMLImageElement | null>(null);
const citySpeed = 2;
const snowflakes: Snowflake[] = [];
const buildings: Building[] = [];
const gifts: Gift[] = [];
let santaY = props.canvas.height / 4;
let floatDirection = 1; // 1 = down, -1 = up

function createSnowflakes() {
    for (let i = 0; i < 100; i++) {
        snowflakes.push({
            x: Math.random() * props.canvas.width,
            y: Math.random() * props.canvas.height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 1,
            z: Math.random() >= 0.5 ? 1 : 2,
            nbBranches: Math.round(Math.random() * 4 + 3)
        });
    }
}

function createBuildings() {
    for (let i = 0; i < 10; i++) {
        const height = 200 + Math.random() * 100;
        const width = 100 + Math.random() * 100;
        const y = props.canvas.height - height;
        const lights = [];
        const roofFeature = Math.random() > 0.7 ? 'antenna' : 'waterTank';

        // Generate lights for this building
        for (let j = 0; j < Math.floor(height / 20); j++) {
            for (let k = 0; k < Math.floor(width / 20); k++) {
                if (Math.random() > 0.6) {
                    lights.push({ x: k * 20 + 5, y: j * 20 + 5, width: 10, height: 10, color: Math.random() > 0.3 ? '#FFF' : '#444' });
                }
            }
        }

        buildings.push({
            x: props.canvas.width + i * 250,
            y: y,
            width: width,
            height: height,
            color: `hsl(${Math.random() * 50 + 200}, 20%, 50%)`,
            lights: lights,
            roofFeature: roofFeature
        });
    }
}

function drawBuildings(cyclePercent: number) {
    for (let i = 0; i < buildings.length; i++) {
        const building = buildings[i];

        // Building body with gradient for depth
        const gradient = props.ctx.createLinearGradient(0, building.y, 0, building.y + building.height);
        gradient.addColorStop(0, building.color);
        gradient.addColorStop(1, 'hsl(200, 20%, 30%)');

        props.ctx.fillStyle = gradient;
        props.ctx.fillRect(building.x, building.y, building.width, building.height);

        const canUpdateLights = Math.random() > 0.7;
        // Draw windows (lights)
        for (const light of building.lights) {
            if (canUpdateLights && cyclePercent >= 1) {
                light.color = Math.random() > 0.3 ? '#FFF' : '#444';
            }
            props.ctx.fillStyle = light.color; // Some lights off
            props.ctx.fillRect(building.x + light.x, building.y + light.y, light.width, light.height);
        }

        // Roof features
        drawRoofFeature(building);
    }
}

function drawRoofFeature(building: Building) {
    if (building.roofFeature === 'antenna') {
        props.ctx.strokeStyle = '#444';
        props.ctx.lineWidth = 2;
        props.ctx.beginPath();
        props.ctx.moveTo(building.x + building.width / 2, building.y);
        props.ctx.lineTo(building.x + building.width / 2, building.y - 20);
        props.ctx.stroke();
        props.ctx.beginPath();
        props.ctx.arc(building.x + building.width / 2, building.y - 25, 5, 0, Math.PI * 2);
        props.ctx.fillStyle = '#444';
        props.ctx.fill();
    } else if (building.roofFeature === 'waterTank') {
        props.ctx.fillStyle = '#666';
        props.ctx.fillRect(building.x + building.width / 4, building.y - 15, building.width / 2, 17);
        props.ctx.fillStyle = '#444';
        props.ctx.fillRect(building.x + building.width / 4 + 5, building.y - 30, building.width / 2 - 10, 15);
    }
}

function drawSnowflakes(z: number) {
    snowflakes.forEach((flake) => {
        if (flake.z !== z) return;

        const radius = flake.radius;
        const x = flake.x;
        const y = flake.y;

        // Function to draw a single branch of the snowflake
        function drawBranch(x: number, y: number, length: number, angle: number) {
            props.ctx.beginPath();
            props.ctx.moveTo(x, y);
            const endX = x + length * Math.cos(angle);
            const endY = y + length * Math.sin(angle);
            props.ctx.lineTo(endX, endY);
            props.ctx.stroke();

            // Adding smaller branches
            if (length > 5) {
                drawBranch(endX, endY, length * 0.6, angle - Math.PI / 4);
                drawBranch(endX, endY, length * 0.6, angle + Math.PI / 4);
            }
        }

        // Draw the main branches of the snowflake
        props.ctx.strokeStyle = '#FFF';
        props.ctx.lineWidth = 2;
        for (let i = 0; i < flake.nbBranches; i++) {
            drawBranch(x, y, radius, (i * Math.PI) / 3);
        }

        // Update snowflake position
        flake.y += flake.speed;
        flake.x -= 0.5;

        // Reset position if snowflake moves out of view
        if (flake.y > props.canvas.height) {
            flake.y = 0;
            flake.x = Math.random() * props.canvas.width;
        }
    });
}


function drawSanta() {
    const santaX = props.canvas.width / 2 - 30; // Center horizontally

    // Draw sleigh
    props.ctx.fillStyle = 'darkred';
    props.ctx.beginPath();
    props.ctx.moveTo(santaX, santaY + 10);
    props.ctx.lineTo(santaX + 60, santaY + 10);
    props.ctx.lineTo(santaX + 70, santaY + 30);
    props.ctx.lineTo(santaX - 10, santaY + 30);
    props.ctx.closePath();
    props.ctx.fill();

    props.ctx.strokeStyle = 'gold';
    props.ctx.lineWidth = 2;
    props.ctx.stroke();

    // Decorative lines on sleigh
    props.ctx.strokeStyle = 'yellow';
    props.ctx.beginPath();
    props.ctx.moveTo(santaX + 5, santaY + 15);
    props.ctx.lineTo(santaX + 55, santaY + 15);
    props.ctx.stroke();

    // Adding more details to the sleigh
    props.ctx.fillStyle = 'gold';
    props.ctx.fillRect(santaX + 5, santaY + 20, 50, 5);
    props.ctx.fillStyle = 'white';
    props.ctx.beginPath();
    props.ctx.arc(santaX, santaY + 20, 3, 0, Math.PI * 2);
    props.ctx.arc(santaX + 60, santaY + 20, 3, 0, Math.PI * 2);
    props.ctx.fill();

    // Draw Santa
    // Body
    props.ctx.fillStyle = 'red';
    props.ctx.fillRect(santaX + 10, santaY - 30, 20, 30); // Body
    props.ctx.fillStyle = 'white';
    props.ctx.fillRect(santaX + 10, santaY - 30, 20, 5);  // Fur trim
    props.ctx.fillStyle = 'black';
    props.ctx.fillRect(santaX + 10, santaY, 20, 8);       // Boots

    // Head facing forward
    props.ctx.beginPath();
    props.ctx.arc(santaX + 20, santaY - 35, 10, 0, Math.PI * 2);
    props.ctx.fillStyle = '#F5CBA7';
    props.ctx.fill();

    // Eyes
    props.ctx.fillStyle = 'black';
    props.ctx.beginPath();
    props.ctx.arc(santaX + 15, santaY - 38, 2, 0, Math.PI * 2);
    props.ctx.arc(santaX + 25, santaY - 38, 2, 0, Math.PI * 2);
    props.ctx.fill();

    // Beard
    props.ctx.fillStyle = 'white';
    props.ctx.beginPath();
    props.ctx.arc(santaX + 20, santaY - 27, 8, 0, Math.PI, true);
    props.ctx.fill();

    // Hat
    props.ctx.beginPath();
    props.ctx.moveTo(santaX + 12, santaY - 45);
    props.ctx.lineTo(santaX + 28, santaY - 45);
    props.ctx.lineTo(santaX + 20, santaY - 55);
    props.ctx.closePath();
    props.ctx.fillStyle = 'red';
    props.ctx.fill();
    props.ctx.beginPath();
    props.ctx.arc(santaX + 20, santaY - 55, 3, 0, Math.PI * 2);
    props.ctx.fillStyle = 'white';
    props.ctx.fill();

    // Belt
    props.ctx.fillStyle = 'black';
    props.ctx.fillRect(santaX + 10, santaY - 10, 20, 5);

    // Reindeer
    drawReindeer(santaX + 80, santaY + 10);
}

function drawReindeer(startX: number, startY: number) {
    for (let i = 0; i < 3; i++) {
        const x = startX + i * 70;

        // Body
        props.ctx.fillStyle = 'brown';
        props.ctx.fillRect(x, startY, 30, 15);

        // Legs
        props.ctx.fillRect(x + 5, startY + 15, 5, 10);
        props.ctx.fillRect(x + 20, startY + 15, 5, 10);

        // Head
        props.ctx.beginPath();
        props.ctx.arc(x + 35, startY + 5, 7, 0, Math.PI * 2);
        props.ctx.fill();

        // Eyes
        props.ctx.fillStyle = 'white';
        props.ctx.beginPath();
        props.ctx.arc(x + 35, startY + 2, 2, 0, Math.PI * 2);
        props.ctx.fill();

        // Nose
        props.ctx.fillStyle = i == 2 ? 'red' : 'brown';
        props.ctx.beginPath();
        props.ctx.arc(x + 43, startY + 5, 3, 0, Math.PI * 2);
        props.ctx.fill();

        // Antlers
        props.ctx.strokeStyle = 'black';
        props.ctx.lineWidth = 2;
        props.ctx.beginPath();
        props.ctx.moveTo(x + 37, startY - 2);
        props.ctx.lineTo(x + 42, startY - 10);
        props.ctx.moveTo(x + 33, startY - 2);
        props.ctx.lineTo(x + 28, startY - 10);
        props.ctx.stroke();

        // Harness line
        props.ctx.strokeStyle = 'gold';
        props.ctx.beginPath();
        if (i > 0) {
            props.ctx.moveTo(x - 45, startY + 10);
        }
        else {
            props.ctx.moveTo(x - 15, startY + 10);
        }
        props.ctx.lineTo(x + 30, startY + 5);
        props.ctx.stroke();
    }

    // Harness line
    props.ctx.strokeStyle = 'gold';
    props.ctx.beginPath();
    props.ctx.moveTo(startX - 50, startY - 30);
    props.ctx.lineTo(startX + 30, startY + 5);
    props.ctx.stroke();
}

function drawGifts() {
    gifts.forEach((gift, index) => {

        if (gift.isSpecial) {
            props.ctx.drawImage(kaspaLogo.value!, gift.x, gift.y, 50, 50);
        }
        else {
            // Draw gift
            props.ctx.fillStyle = gift.color;
            props.ctx.fillRect(gift.x, gift.y, gift.width, gift.height);
            props.ctx.fillStyle = gift.color === gift.ribbon ? 'white' : gift.ribbon;
            props.ctx.fillRect(gift.x + gift.width / 4, gift.y, gift.width / 6, gift.height);
            props.ctx.fillRect(gift.x, gift.y + gift.height / 4, gift.width, gift.height / 6);
        }
        // Update position
        gift.y += gift.speed;
        gift.x -= gift.speed;

        // Remove gift if it reaches the bottom
        if (gift.y > props.canvas.height) {
            gifts.splice(index, 1);
        }
    });
}

function updateSantaPosition() {
    if (santaY > props.canvas.height / 4 + 20) floatDirection = -1; // Move up
    else if (santaY < props.canvas.height / 4 - 20) floatDirection = 1; // Move down

    santaY += floatDirection * 0.5; // Smooth floating effect
}

function updateBuildings() {
    for (let i = 0; i < buildings.length; i++) {
        buildings[i].x -= citySpeed;

        // Recycle buildings
        if (buildings[i].x + buildings[i].width < 0) {
            buildings[i].x = props.canvas.width + Math.random() * 500;
        }
    }
}

function shootGift(val: { hash: string, count: number }) {
    const colors = ['red', 'brown', 'green', 'gold'];
    function scaleToLogarithmic(value: number) {
        // Ensure the value is within the range 1 to 200
        if (value < 1) value = 1;
        if (value > 200) value = 200;

        // Calculate logarithmic scaling
        const minLog = Math.log(1);
        const maxLog = Math.log(200);
        const midLog = Math.log(20);
        const scaleLog = Math.log(value);

        // Normalize the logarithmic value
        const normalizedValue = (scaleLog - minLog) / (maxLog - minLog);

        // Adjust the midpoint
        const midNormalized = (midLog - minLog) / (maxLog - minLog);
        const scaledValue = normalizedValue / (2 * midNormalized);

        // Final result between 0 and 1
        const finalValue = Math.min(Math.max(scaledValue, 0), 1);

        return finalValue;
    }
    const giftWidth = scaleToLogarithmic(val.count) * 60 + Math.random() * 10;
    const giftHeight = scaleToLogarithmic(val.count) * 60 + Math.random() * 10;
    gifts.push({
        x: props.canvas.width / 2 - 30,
        y: santaY,
        width: giftWidth,
        height: giftHeight,
        speed: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        ribbon: colors[Math.floor(Math.random() * colors.length)],
        isSpecial: Math.random() < 0.2
    });
}

onMounted(() => {
    function animate(timestamp: number) {
        props.ctx.clearRect(0, 0, props.canvas.width, props.canvas.height);
        drawSnowflakes(1);
        drawBuildings((timestamp - zero) / 2000);
        drawSanta();
        drawSnowflakes(2);
        updateSantaPosition();
        updateBuildings();
        drawGifts();

        if ((timestamp - zero) / 2000 > 1) zero = performance.now()

        requestAnimationFrame(animate);
    }

    let zero = performance.now();

    createSnowflakes();
    createBuildings();
    animate(zero);
})
</script>
<template>
    <img ref="kaspaLogo" src="/kaspa-logo.svg" alt="" style="visibility: hidden; width: 0; height: 0;">
</template>