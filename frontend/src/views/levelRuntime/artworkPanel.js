const DEFAULT_NAME_LIMIT = 20;

export function normalizePlayerName(value, maxCharacters = DEFAULT_NAME_LIMIT) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxCharacters);
}
export function createArtworkRequest({ expression = {}, expressionPayload = {}, playerName = "", favoriteFragmentId = "" } = {}) {
  return {
    playerName: normalizePlayerName(playerName),
    playerText: String(expressionPayload.userText || "").trim(),
    expressionTitle: String(expression.title || "").trim(),
    expressionText: String(expression.text || "").trim(),
    sourceIds: Array.isArray(expressionPayload.sourceIds)
      ? expressionPayload.sourceIds.slice(0, 3).map(String)
      : [],
    favoriteFragmentId: String(favoriteFragmentId || "").trim(),
  };
}

export function createLevelArtworkPanel(options = {}) {
  return new LevelArtworkPanel(options);
}

class LevelArtworkPanel {
  constructor({ config = {}, context = {}, onGenerate, onPersist } = {}) {
    this.config = config;
    this.onGenerate = typeof onGenerate === "function" ? onGenerate : null;
    this.onPersist = typeof onPersist === "function" ? onPersist : null;
    this.fragments = Array.isArray(context?.fragments) ? context.fragments.slice(0, 3) : [];
    this.expression = null;
    this.expressionPayload = null;
    this.controller = new AbortController();
    this.element = this.build();
  }

  mount(container) {
    if (!container || typeof container.appendChild !== "function") return this;
    container.appendChild(this.element);
    return this;
  }

  destroy() {
    this.controller.abort();
    this.element.remove();
  }

  setExpression(expression, expressionPayload) {
    this.expression = expression;
    this.expressionPayload = expressionPayload;
    this.element.hidden = false;
    this.generateButton.disabled = false;
    this.generateButton.textContent = "创作我的长征画作";
    this.status.textContent = "文字已经完成。填写署名后，可以把主题、碎片和你的表达交给 AI 创作成画。";
    this.status.className = "level-artwork-panel__status";
  }

  build() {
    const section = document.createElement("section");
    section.className = "level-artwork-panel";
    section.hidden = true;
    section.innerHTML = `
      <div class="level-artwork-panel__heading">
        <span>带走一件作品</span>
        <h4>创作我的长征画作</h4>
        <p>AI 会根据你选择的主题、三块历史碎片和刚刚生成的讲解，创作一幅新的画。</p>
      </div>
      <div class="level-artwork-panel__controls">
        <label for="level-artwork-player-name">右下角署名</label>
        <input id="level-artwork-player-name" type="text" maxlength="${this.nameLimit}" autocomplete="off" placeholder="输入你的名字或昵称" />
        <label for="level-artwork-favorite-fragment" ${this.fragments.length ? "" : "hidden"}>选择要打印带走的碎片</label>
        <select id="level-artwork-favorite-fragment" ${this.fragments.length ? "" : "hidden"}>
          <option value="">请选择一块碎片</option>
        </select>
        <button type="button" data-generate-artwork>创作我的长征画作</button>
      </div>
      <p class="level-artwork-panel__status" role="status" aria-live="polite"></p>
      <figure class="level-artwork-panel__figure" hidden>
        <div class="level-artwork-panel__canvas-wrap">
          <canvas width="1024" height="576" aria-label="玩家的长征主题数字画作"></canvas>
          <span class="level-artwork-panel__signature" hidden></span>
        </div>
        <figcaption></figcaption>
        <button type="button" class="level-artwork-panel__save" data-save-artwork hidden>保存纪念画</button>
      </figure>
      <section class="level-artwork-panel__share" hidden>
        <canvas width="176" height="176" aria-label="扫码带走作品二维码"></canvas>
        <div>
          <strong>扫码带走我的长征记忆</strong>
          <p>作品将在云端保存30天。</p>
          <a target="_blank" rel="noreferrer noopener">打开我的作品页</a>
          <button type="button" data-print-fragment-card hidden>打印或保存碎片纪念卡</button>
        </div>
      </section>`;
    this.nameInput = section.querySelector("input");
    this.generateButton = section.querySelector("[data-generate-artwork]");
    this.favoriteSelect = section.querySelector("select");
    for (const fragment of this.fragments) {
      const option = document.createElement("option");
      option.value = fragment.id;
      option.textContent = fragment.name;
      this.favoriteSelect.appendChild(option);
    }
    this.status = section.querySelector(".level-artwork-panel__status");
    this.figure = section.querySelector("figure");
    this.canvas = section.querySelector(".level-artwork-panel__canvas-wrap canvas");
    this.signature = section.querySelector(".level-artwork-panel__signature");
    this.caption = section.querySelector("figcaption");
    this.saveButton = section.querySelector("[data-save-artwork]");
    this.share = section.querySelector(".level-artwork-panel__share");
    this.qrCanvas = this.share.querySelector("canvas");
    this.shareDescription = this.share.querySelector("p");
    this.shareLink = this.share.querySelector("a");
    this.cardButton = this.share.querySelector("[data-print-fragment-card]");
    this.nameInput.addEventListener("input", () => this.clearError(), { signal: this.controller.signal });
    this.generateButton.addEventListener("click", () => this.generate(), { signal: this.controller.signal });
    this.saveButton.addEventListener("click", () => this.save(), { signal: this.controller.signal });
    this.cardButton.addEventListener("click", () => this.printFragmentCard(), { signal: this.controller.signal });
    return section;
  }

  get nameLimit() {
    return Math.min(Number(this.config.nameMaxCharacters) || DEFAULT_NAME_LIMIT, DEFAULT_NAME_LIMIT);
  }

  async generate() {
    if (!this.onGenerate || !this.expression) return;
    const playerName = normalizePlayerName(this.nameInput.value, this.nameLimit);
    if (!playerName) {
      this.setError("请先输入要写在画作右下角的名字或昵称");
      this.nameInput.focus();
      return;
    }
    const favoriteFragmentId = String(this.favoriteSelect?.value || "");
    if (this.fragments.length && !favoriteFragmentId) {
      this.setError("请选择一块最想打印带走的碎片");
      this.favoriteSelect.focus();
      return;
    }
    this.nameInput.value = playerName;
    this.generateButton.disabled = true;
    this.generateButton.textContent = "正在创作，请稍候…";
    this.status.className = "level-artwork-panel__status is-loading";
    this.status.textContent = "AI 正在把主题、碎片和你的表达组织成画面，预计需要几十秒。请不要重复点击。";
    const request = createArtworkRequest({
      expression: this.expression,
      expressionPayload: this.expressionPayload,
      playerName,
      favoriteFragmentId,
    });
    try {
      const value = await this.onGenerate(request);
      await this.renderImage(value.imageDataUrl || value.imageUrl, playerName, true);
      this.status.className = "level-artwork-panel__status is-success";
      this.status.textContent = "画作已经完成。姓名由展台系统准确署在右下角。";
      this.generateButton.textContent = "画作已完成";
      await this.persistArtwork(request, true);
    } catch (error) {
      await this.renderImage(this.resolveAsset(this.config.fallbackImage), playerName, false).catch(() => {});
      this.status.className = "level-artwork-panel__status is-error";
      this.status.textContent = `${artworkFallbackMessage(error.code)}已保留固定纪念画面，不影响完成体验。`;
      if (error.requestId) this.status.title = `请求编号：${error.requestId}`;
      this.generateButton.textContent = "本次使用纪念画面";
      await this.persistArtwork(request, false);
    }
  }

  async persistArtwork(request, generatedByAi) {
    if (!this.onPersist || this.figure.hidden) return;
    this.share.hidden = false;
    this.share.classList.add("is-loading");
    this.shareDescription.textContent = "正在保存作品并生成二维码……";
    this.shareLink.removeAttribute("href");
    try {
      const imageDataUrl = this.canvas.toDataURL("image/jpeg", 0.9);
      const saved = await this.onPersist({ ...request, imageDataUrl, generatedByAi });
      const QRCode = (await import("qrcode")).default;
      await QRCode.toCanvas(this.qrCanvas, saved.shareUrl, {
        width: 176,
        margin: 1,
        color: { dark: "#2d1712", light: "#fff9ea" },
      });
      this.share.classList.remove("is-loading", "is-error");
      const expiry = new Date(saved.expiresAt).toLocaleDateString("zh-CN");
      this.shareDescription.textContent = `扫码后可保存完整作品，有效期至 ${expiry}。`;
      this.shareLink.href = saved.shareUrl;
      this.shareUrl = saved.shareUrl;
      this.cardButton.hidden = !request.favoriteFragmentId;
    } catch (error) {
      this.share.classList.remove("is-loading");
      this.share.classList.add("is-error");
      this.shareDescription.textContent = `${error.message || "二维码暂时无法生成"}，仍可使用上方按钮保存画作。`;
      // 二维码服务不可用时仍允许现场打印碎片卡，避免网络故障阻断带走环节。
      this.cardButton.hidden = !request.favoriteFragmentId;
    }
  }

  async printFragmentCard() {
    const fragmentId = String(this.favoriteSelect?.value || "");
    const fragment = this.fragments.find((item) => item.id === fragmentId);
    if (!fragment) {
      this.setError("请先选择一块要打印的碎片");
      return;
    }
    const printWindow = window.open("", "_blank", "width=640,height=900");
    if (!printWindow) {
      this.setError("浏览器阻止了打印窗口，请允许弹窗后重试");
      return;
    }
    printWindow.document.write("<p style='font-family:sans-serif;padding:24px'>正在制作碎片纪念卡……</p>");
    try {
      const card = await this.createFragmentCard(fragment);
      const dataUrl = card.toDataURL("image/png");
      printWindow.document.open();
      printWindow.document.write(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>我的长征碎片纪念卡</title><style>@page{size:A6 portrait;margin:0}html,body{margin:0;background:#eee}img{display:block;width:105mm;height:148mm;object-fit:contain;margin:auto}@media print{html,body{background:#fff}}</style></head><body><img src="${dataUrl}" alt="碎片纪念卡"><script>document.querySelector('img').onload=()=>{setTimeout(()=>window.print(),120)}<\/script></body></html>`);
      printWindow.document.close();
    } catch (error) {
      printWindow.close();
      this.setError(error.message || "碎片纪念卡生成失败");
    }
  }

  async createFragmentCard(fragment) {
    const card = document.createElement("canvas");
    card.width = 1240;
    card.height = 1748;
    const context = card.getContext("2d");
    context.fillStyle = "#f4ead3";
    context.fillRect(0, 0, card.width, card.height);
    context.fillStyle = "#8d2e25";
    context.fillRect(0, 0, card.width, 188);
    context.fillStyle = "#fff2d2";
    context.font = "700 46px 'Microsoft YaHei', sans-serif";
    context.fillText("重走长征路 · 我的碎片纪念卡", 72, 112);

    const image = await this.loadImage(this.resolveAsset(fragment.image));
    context.fillStyle = "#211711";
    context.fillRect(72, 244, 1096, 760);
    drawContained(context, image, 110, 282, 1020, 684);

    context.fillStyle = "#8d2e25";
    context.font = "700 70px 'Microsoft YaHei', sans-serif";
    context.fillText(fragment.name, 76, 1115);
    context.fillStyle = "#4b3829";
    context.font = "36px 'Microsoft YaHei', sans-serif";
    drawWrappedText(context, fragment.fact || fragment.visual || "这是一块从长征互动体验中获得的数字碎片。", 76, 1182, 1080, 54, 3);

    context.fillStyle = "#6f5540";
    context.font = "32px 'Microsoft YaHei', sans-serif";
    drawWrappedText(context, `“${this.expression?.text || "我愿意记住这段行程中的选择与坚持。"}”`, 76, 1370, 760, 48, 3);
    context.fillStyle = "#8d2e25";
    context.font = "700 34px 'Microsoft YaHei', sans-serif";
    context.fillText(`—— ${normalizePlayerName(this.nameInput.value)}`, 76, 1608);

    if (this.shareUrl && !this.share.hidden) {
      context.drawImage(this.qrCanvas, 904, 1325, 236, 236);
      context.fillStyle = "#5e4938";
      context.font = "24px 'Microsoft YaHei', sans-serif";
      context.textAlign = "center";
      context.fillText("扫码查看完整数字展台", 1022, 1595);
      context.textAlign = "left";
    }
    context.fillStyle = "#8d2e25";
    context.fillRect(72, 1680, 1096, 4);
    context.fillStyle = "#735b45";
    context.font = "25px 'Microsoft YaHei', sans-serif";
    context.fillText("纪念长征胜利90周年", 76, 1725);
    return card;
  }

  async renderImage(source, playerName, generatedByAi) {
    if (!source) throw new Error("没有可显示的画作");
    const image = await this.loadImage(source);
    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
    this.drawSignature(context, playerName);
    this.signature.hidden = true;
    this.figure.hidden = false;
    this.caption.textContent = generatedByAi
      ? "AI 根据玩家选择创作 · 署名由数字展台添加"
      : "在线生图不可用时使用项目纪念画面 · 署名由数字展台添加";
    this.saveButton.hidden = false;
  }

  drawSignature(context, playerName) {
    const label = `—— ${playerName}`;
    context.save();
    context.font = "600 28px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    context.textAlign = "right";
    context.textBaseline = "middle";
    const width = context.measureText(label).width + 44;
    const x = this.canvas.width - 34;
    const y = this.canvas.height - 42;
    context.fillStyle = "rgba(24, 15, 10, 0.68)";
    context.fillRect(x - width, y - 27, width + 12, 54);
    context.shadowColor = "rgba(0, 0, 0, 0.65)";
    context.shadowBlur = 5;
    context.fillStyle = "#fff3d0";
    context.fillText(label, x, y);
    context.restore();
  }

  loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      if (!String(source).startsWith("data:")) image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("画作加载失败"));
      image.src = source;
    });
  }

  save() {
    const playerName = normalizePlayerName(this.nameInput.value, this.nameLimit) || "我的长征";
    this.canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `我的长征画作-${playerName}.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }, "image/png");
  }

  resolveAsset(value) {
    if (!value || /^(data:|https?:)/.test(value)) return value;
    const base = window.__BASE_PATH__ || import.meta.env?.BASE_URL || "/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const source = String(value).replace(/^\.\//, "");
    if (normalizedBase === "/" && source.startsWith("/")) return source;
    if (normalizedBase !== "/" && source.startsWith(normalizedBase)) return source;
    return `${normalizedBase}${source.replace(/^\//, "")}`;
  }

  clearError() {
    if (!this.status.classList.contains("is-error")) return;
    this.status.className = "level-artwork-panel__status";
    this.status.textContent = "填写署名后即可创作。";
  }

  setError(message) {
    this.status.className = "level-artwork-panel__status is-error";
    this.status.textContent = message;
  }
}

function artworkFallbackMessage(reason) {
  const messages = {
    quota: "今日在线画作额度已用完。",
    auth: "在线画作服务认证暂时不可用。",
    timeout: "在线画作等待超时，本次没有自动重试。",
    config: "在线画作尚未启用或配置完成。",
    response: "在线画作结果暂时无法解析。",
    validation: "本次画作选择未通过数据校验。",
    upstream: "在线画作服务暂时不可用。",
  };
  return messages[reason] || messages.upstream;
}

function drawContained(context, image, x, y, width, height) {
  const scale = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines) {
  const characters = [...String(text || "")];
  let line = "";
  let lineIndex = 0;
  for (let index = 0; index < characters.length && lineIndex < maxLines; index += 1) {
    const candidate = line + characters[index];
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y + lineIndex * lineHeight);
      line = characters[index];
      lineIndex += 1;
    } else {
      line = candidate;
    }
  }
  if (line && lineIndex < maxLines) context.fillText(line, x, y + lineIndex * lineHeight);
}
