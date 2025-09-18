import { CanvasGradient, CanvasRenderingContext2D } from "skia-canvas";
import { XY } from "../type";
import { StarStyle } from "../style";

export function drawStar(
    ctx: CanvasRenderingContext2D,
    { x, y }: XY,
    { glowRadius, glowAlpha, spikesStyle: spikes, scale, radius, color }: StarStyle,
): void {
    ctx.fillStyle = __makeGradient(ctx, x, y , glowRadius, glowAlpha, scale);
    ctx.beginPath(); ctx.arc(x, y, glowRadius * scale, 0, Math.PI * 2);
    ctx.fill();

    if (spikes.count) {
        ctx.save();
        ctx.globalAlpha = spikes.alpha;
        ctx.translate(x, y);

        for (let i = 0; i < spikes.count; i++) {
            ctx.rotate((Math.PI * 2 * i) / spikes.count);
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(spikes.length * scale, 0);
            ctx.lineWidth = spikes.width;
            ctx.strokeStyle = spikes.color;
            ctx.stroke();
        }

        ctx.restore();
    }

    ctx.beginPath(); ctx.arc(x, y, radius * scale, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function __makeGradient(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    glowRadius: number,
    glowAlpha: number,
    scale: number,
): CanvasGradient {
    const g: CanvasGradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius * scale);
    g.addColorStop(0, `rgba(255,255,255,${glowAlpha})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    return g;
}

