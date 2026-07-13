export function setupSquadSelect(onSelected) {
  const player = document.querySelector("#squad-player");
  const slot = document.querySelector("#squad-slot");
  const select = document.querySelector("#squad-select");

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  function toPoint(event) {
    if (event.touches && event.touches[0]) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    return { x: event.clientX, y: event.clientY };
  }

  function onDown(event) {
    dragging = true;
    const rect = player.getBoundingClientRect();
    const point = toPoint(event);
    offsetX = point.x - rect.left;
    offsetY = point.y - rect.top;
    player.style.position = "fixed";
    player.style.transform = "none";
    player.style.animation = "none";
    player.style.zIndex = "50";
    moveTo(point);
  }

  function moveTo(point) {
    player.style.left = `${point.x - offsetX}px`;
    player.style.top = `${point.y - offsetY}px`;
  }

  function onMove(event) {
    if (!dragging) return;
    event.preventDefault();
    moveTo(toPoint(event));
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;

    const playerRect = player.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    const overlap =
      playerRect.left < slotRect.right &&
      playerRect.right > slotRect.left &&
      playerRect.top < slotRect.bottom &&
      playerRect.bottom > slotRect.top;

    if (overlap) {
      player.classList.add("squad-select__player--locked");
      const rect = slot.getBoundingClientRect();
      player.style.left = `${rect.left + rect.width / 2 - playerRect.width / 2}px`;
      player.style.top = `${rect.top + rect.height / 2 - playerRect.height / 2}px`;
      slot.textContent = "我去！";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      setTimeout(() => {
        select.classList.add("squad-select--fadeout");
        setTimeout(onSelected, 500);
      }, 500);
    }
  }

  player.addEventListener("pointerdown", onDown);
  player.addEventListener("touchstart", onDown, { passive: true });
  window.addEventListener("pointermove", onMove, { passive: false });
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("touchend", onUp);
}

