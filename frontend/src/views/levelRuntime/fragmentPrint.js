const DEFAULT_VISITOR_NAME = "重走长征路的参观者";

export function normalizeFragmentCardName(value, maxCharacters = 20) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxCharacters);
}

export async function printArchiveFragmentCard({ fragment, playerName = "", quote = "" } = {}) {
  if (!fragment?.id) throw new Error("请先选择一块要打印的碎片");
  const printWindow = window.open("", "_blank", "width=640,height=900");
  if (!printWindow) throw new Error("浏览器阻止了打印窗口，请允许弹窗后重试");

  printWindow.document.write("<p style='font-family:sans-serif;padding:24px'>正在制作碎片纪念卡……</p>");
  try {
    const canvas = await createArchiveFragmentCard({ fragment, playerName, quote });
    const dataUrl = canvas.toDataURL("image/png");
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>我的长征碎片纪念卡</title><style>@page{size:A6 portrait;margin:0}html,body{margin:0;background:#eee}img{display:block;width:105mm;height:148mm;object-fit:contain;margin:auto}@media print{html,body{background:#fff}}</style></head><body><img src="${dataUrl}" alt="碎片纪念卡"><script>document.querySelector('img').onload=()=>{setTimeout(()=>window.print(),120)}<\/script></body></html>`);
    printWindow.document.close();
    return true;
  } catch (error) {
    printWindow.close();
    throw error;
  }
}

export async function createArchiveFragmentCard({ fragment, playerName = "", quote = "" } = {}) {
  if (!fragment?.id) throw new Error("缺少碎片资料");
  const card = document.createElement("canvas");
  card.width = 1240;
  card.height = 1748;
  const context = card.getContext("2d");
  const safeName = normalizeFragmentCardName(playerName) || DEFAULT_VISITOR_NAME;

  context.fillStyle = "#f4ead3";
  context.fillRect(0, 0, card.width, card.height);
  context.fillStyle = "#8d2e25";
  context.fillRect(0, 0, card.width, 188);
  context.fillStyle = "#fff2d2";
  context.font = "700 46px 'Microsoft YaHei', sans-serif";
  context.fillText("重走长征路 · 我的碎片纪念卡", 72, 112);

  context.fillStyle = "#211711";
  context.fillRect(72, 244, 1096, 760);
  try {
    const image = await loadImage(resolveAsset(fragment.image));
    drawContained(context, image, 110, 282, 1020, 684);
  } catch {
    context.fillStyle = "#d7c39d";
    context.font = "700 88px 'Microsoft YaHei', sans-serif";
    context.textAlign = "center";
    context.fillText(fragment.name || "长征碎片", card.width / 2, 650);
    context.textAlign = "left";
  }

  context.fillStyle = "#8d2e25";
  context.font = "700 70px 'Microsoft YaHei', sans-serif";
  context.fillText(fragment.name || "长征碎片", 76, 1115);
  context.fillStyle = "#4b3829";
  context.font = "36px 'Microsoft YaHei', sans-serif";
  drawWrappedText(context, fragment.fact || fragment.visual || "这是一块从长征互动体验中获得的数字碎片。", 76, 1182, 1080, 54, 3);

  context.fillStyle = "#6f5540";
  context.font = "32px 'Microsoft YaHei', sans-serif";
  drawWrappedText(context, `“${quote || "我愿意把这段行程中的选择与坚持带走。"}”`, 76, 1390, 1080, 48, 3);
  context.fillStyle = "#8d2e25";
  context.font = "700 34px 'Microsoft YaHei', sans-serif";
  context.fillText(`—— ${safeName}`, 76, 1608);

  context.fillStyle = "#8d2e25";
  context.fillRect(72, 1680, 1096, 4);
  context.fillStyle = "#735b45";
  context.font = "25px 'Microsoft YaHei', sans-serif";
  context.fillText("纪念长征胜利90周年", 76, 1725);
  return card;
}

function resolveAsset(value) {
  if (!value || /^(data:|https?:)/.test(value)) return value;
  const base = window.__BASE_PATH__ || import.meta.env?.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const source = String(value).replace(/^\.\//, "");
  if (normalizedBase === "/" && source.startsWith("/")) return source;
  if (normalizedBase !== "/" && source.startsWith(normalizedBase)) return source;
  return `${normalizedBase}${source.replace(/^\//, "")}`;
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    if (!source) {
      reject(new Error("碎片图片缺失"));
      return;
    }
    const image = new Image();
    if (!String(source).startsWith("data:")) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("碎片图片加载失败"));
    image.src = source;
  });
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
