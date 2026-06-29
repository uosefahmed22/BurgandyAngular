const sharp = require('sharp');

async function run() {
  try {
    await sharp('src/assets/BurgandyLandingPage.webp')
      .resize(721)
      .toFile('src/assets/BurgandyLandingPage-sm.webp');
    console.log('Resized Landing Page image.');

    await sharp('src/assets/Burgandy.webp')
      .resize(200)
      .toFile('src/assets/Burgandy-sm.webp');
    console.log('Resized Logo image.');
  } catch (err) {
    console.error(err);
  }
}

run();
