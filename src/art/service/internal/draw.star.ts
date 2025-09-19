import { CanvasGradient, CanvasRenderingContext2D } from "skia-canvas";
import { StarStyle } from "../../style";

export function drawStar(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    { core, glow, spikes, scale }: StarStyle,
): void {
    ctx.fillStyle = __makeGradient(ctx, x, y, glow, scale);

    ctx.beginPath();
    ctx.arc(x, y, glow.radius * scale, 0, Math.PI * 2);
    ctx.fill();

    // Spikes
    if (spikes.count > 0) {
        ctx.save();
        ctx.globalAlpha = spikes.alpha;
        ctx.translate(x, y);

        for (let i = 0; i < spikes.count; i++) {
            ctx.rotate((Math.PI * 2 * i) / spikes.count);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(spikes.length * scale, 0);
            ctx.lineWidth = spikes.width;
            ctx.strokeStyle = spikes.color;
            ctx.stroke();
        }

        ctx.restore();
    }

    // Core
    ctx.beginPath();
    ctx.arc(x, y, core.radius * scale, 0, Math.PI * 2);
    ctx.fillStyle = core.color;
    ctx.fill();
}

function __makeGradient(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    { radius, color, alpha }: StarStyle["glow"],
    scale: number,
): CanvasGradient {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius * scale);
    g.addColorStop(0, `${color}${Math.round(255 * alpha).toString(16).padStart(2, "0")}`);
    g.addColorStop(1, `${color}00`);
    return g;
}