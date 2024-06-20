function play() {
    keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    }
    document.getElementById("btn-container").classList.add("d-none");
    document.getElementById("level-label").classList.remove("d-none");
    document.getElementById("meteorites-left").classList.remove("d-none");
    level = 1
    document.getElementById("level-label").innerText = "Level " + level;
    generateRandomMeteorite(level);
    document.getElementById("meteorites-left").innerText = "Meteorites left: " + meteorites.length;
  }
  
  function nextLevel() {
    level += 1;
    document.getElementById("level-label").innerText = "Level " + level;
    generateRandomMeteorite(level);
    document.getElementById("meteorites-left").innerText = "Meteorites left: " + meteorites.length;
  }
  
  function updateMetoritesLeft() {
    document.getElementById("meteorites-left").innerText = "Meteorites left: " + meteorites.length;
  }
  
  function gameover(levelReached, meteoritesLeft) {
    level = 0;
    document.getElementById("earth-explosion").play();
    document.getElementById("btn-container").classList.remove("d-none");
    document.getElementById("level-label").classList.add("d-none");
    document.getElementById("meteorites-left").classList.add("d-none");
    document.getElementById("score").innerText = "Gameover \n Score:\nLevel " + levelReached + " with " + meteoritesLeft + " meteorites left";
    document.getElementById("score").classList.remove("d-none");
  }

  function setLightFromMouse() {
    document.getElementById("heading-container").classList.add("flex-md-row");
    document.getElementById("light-question").classList.add("d-none");
    document.getElementById("light-btn").classList.add("d-none");
    document.getElementById("btn-container").classList.remove("d-none");
    document.getElementById("command-container").classList.remove("d-none");
  }