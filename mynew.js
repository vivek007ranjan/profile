// Function to load image and get pixel data
function getImageData(url, callback) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    callback(imageData, canvas.width, canvas.height);
  };
  img.src = url;
}

// Convert image data to particle positions
function imageToParticles(imageData, width, height, numParticles) {
  const particles = [];
  const step = Math.sqrt((width * height) / numParticles);
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (Math.floor(y) * width + Math.floor(x)) * 4;
      const alpha = imageData[index + 3];
      if (alpha > 128) {
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        const color = `rgb(${r}, ${g}, ${b})`;
        particles.push({ x, y, tx: x, ty: y, color });
      }
    }
  }
  return particles;
}

// Function to animate particles forming the image
function animateFormation(particles, context, canvas) {
  function animationStep() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    let allParticlesArrived = true;

    particles.forEach(particle => {
      const dx = particle.tx - particle.x;
      const dy = particle.ty - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 1) {
        particle.x += dx * 0.05;
        particle.y += dy * 0.05;
        allParticlesArrived = false;
      }

      // Draw particle
      context.fillStyle = particle.color;
      context.fillRect(particle.x - 1, particle.y - 1, 2, 2);  // Adjusted to center the particle
    });

    if (!allParticlesArrived) {
      requestAnimationFrame(animationStep);
    }
  }

  animationStep();
}

document.getElementById('form-image-button').addEventListener('click', () => {
  const canvas = document.getElementById('image-canvas');
  const context = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const numParticles = parseInt(document.getElementById('particle-count-input').value, 10) || 100;

  getImageData('./example.png', (imageData, width, height) => {
    const imageParticles = imageToParticles(imageData, width, height, numParticles);
    const particles = [];

    for (let i = 0; i < numParticles; i++) {
      const imgParticle = imageParticles[i % imageParticles.length];
      const p = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        tx: imgParticle.tx * (canvas.width / width),
        ty: imgParticle.ty * (canvas.height / height),
        color: imgParticle.color
      };
      particles.push(p);
    }

    animateFormation(particles, context, canvas);
  });
});
