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
  img.src = "./example.png";
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
        particles.push({ x, y });
      }
    }
  }
  return particles;
}

// Function to animate particles forming the image
function animateFormation(particles, context, canvas) {
  let allParticlesArrived = false;

  function animationStep() {
    if (allParticlesArrived) return;

    allParticlesArrived = true;
    context.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      const dx = particle.tx - particle.x;
      const dy = particle.ty - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 1) {
        particle.x += dx * 0.05;
        particle.y += dy * 0.05;
        allParticlesArrived = false;
      }
      

     context.fillStyle = particle.color;
    context.fillRect(particle.x, particle.y, 2, 2);

       // Draw particle
     //  context.fillStyle = particle.color;
     //  context.fillRect(particle.x - particleSize / 2, particle.y - particleSize / 2, particleSize, particleSize);
    
    });

    requestAnimationFrame(animationStep);
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
      const p = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        tx: imageParticles[i % imageParticles.length].x * canvas.width / width,
        ty: imageParticles[i % imageParticles.length].y * canvas.height / height,
        color: 'rgba(255,255,255,1)'
      };
      particles.push(p);
    }


    animateFormation(particles, context, canvas);
  });
});
