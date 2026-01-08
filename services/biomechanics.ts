
import { PoseLandmarks, Landmark, PostureMetrics } from '../types';

/**
 * Calcula o ângulo (em graus) entre três pontos (A-B-C), onde B é o vértice.
 */
export const calculateAngle = (a: Landmark, b: Landmark, c: Landmark): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
};

/**
 * Calcula o ângulo de inclinação de uma linha formada por dois pontos em relação à horizontal.
 * Retorna graus (positivo = inclinado para direita/baixo dependendo da referência).
 */
export const calculateHorizontalTilt = (left: Landmark, right: Landmark): number => {
    const dy = right.y - left.y;
    const dx = right.x - left.x;
    const theta = Math.atan2(dy, dx);
    return theta * (180 / Math.PI);
};

/**
 * Calcula o desvio do tronco em relação à linha vertical absoluta.
 * Usa o ponto médio dos ombros e o ponto médio do quadril.
 */
export const calculateTrunkLean = (shoulders: {l: Landmark, r: Landmark}, hips: {l: Landmark, r: Landmark}): number => {
    const midShoulder = {
        x: (shoulders.l.x + shoulders.r.x) / 2,
        y: (shoulders.l.y + shoulders.r.y) / 2
    };
    const midHip = {
        x: (hips.l.x + hips.r.x) / 2,
        y: (hips.l.y + hips.r.y) / 2
    };

    // Ângulo da linha conectando MidHip -> MidShoulder com a vertical
    // dx = x2 - x1, dy = y2 - y1. Vertical line means dx = 0.
    const dx = midShoulder.x - midHip.x;
    const dy = midShoulder.y - midHip.y; // usually negative because y=0 is top
    
    // Angle from vertical (90 deg in standard atan2). 
    // Simplified: atan(dx/dy) converts slope to angle from vertical
    const angleRad = Math.atan2(dx, -dy); // -dy to make up positive
    return angleRad * (180 / Math.PI);
};

export const analyzePosture = (landmarks: { front?: PoseLandmarks, side?: PoseLandmarks, back?: PoseLandmarks }): PostureMetrics => {
    const metrics: PostureMetrics = {};

    // --- ANÁLISE FRONTAL ---
    if (landmarks.front) {
        const f = landmarks.front;

        // 1. Head Tilt (Olhos ou Orelhas)
        if (f.leftEye && f.rightEye) {
            metrics.headTiltDeg = calculateHorizontalTilt(f.leftEye, f.rightEye);
        } else if (f.leftEar && f.rightEar) {
            metrics.headTiltDeg = calculateHorizontalTilt(f.leftEar, f.rightEar);
        }

        // 2. Shoulder Height Diff (Desnível de Ombros) & Tilt
        if (f.leftShoulder && f.rightShoulder) {
            // Diferença relativa Y (normalizada)
            metrics.shoulderHeightDiff = Math.abs(f.leftShoulder.y - f.rightShoulder.y);
        }

        // 3. Pelvic Tilt (Desnível Pélvico)
        if (f.leftHip && f.rightHip) {
            metrics.pelvicTiltDeg = calculateHorizontalTilt(f.leftHip, f.rightHip);
        }

        // 4. Trunk Lean (Desvio lateral do tronco)
        if (f.leftShoulder && f.rightShoulder && f.leftHip && f.rightHip) {
            metrics.trunkLeanDeg = calculateTrunkLean(
                {l: f.leftShoulder, r: f.rightShoulder},
                {l: f.leftHip, r: f.rightHip}
            );
        }

        // 5. Knee Valgus/Varus Estimate (Ângulo Q Simplificado: Hip-Knee-Ankle)
        // 180 = Reto. < 175 = Valgo (joelhos dentro), > 185 = Varo (joelhos fora) *Depende da medição interna/externa
        // Aqui calculamos o ângulo interno da perna.
        if (f.leftHip && f.leftKnee && f.leftAnkle) {
            // Ângulo interno do joelho esquerdo
            const angleL = calculateAngle(f.leftHip, f.leftKnee, f.leftAnkle);
            metrics.kneeValgus = { ...metrics.kneeValgus, left: angleL } as any;
        }
        if (f.rightHip && f.rightKnee && f.rightAnkle) {
            // Ângulo interno do joelho direito
            const angleR = calculateAngle(f.rightHip, f.rightKnee, f.rightAnkle);
            metrics.kneeValgus = { ...metrics.kneeValgus, right: angleR } as any;
        }
    }

    // --- ANÁLISE PERFIL (SAGITAL) ---
    if (landmarks.side) {
        const s = landmarks.side;
        
        // 1. Anteriorização da Cabeça (Forward Head)
        // Diferença no eixo X entre Orelha e Ombro (Assumindo perfil esquerdo: orelha deve estar alinhada ou levemente a frente)
        if (s.leftEar && s.leftShoulder) {
            // Valor positivo se orelha estiver à frente (X menor ou maior dependendo da orientação)
            // Assumindo perfil olhando para a ESQUERDA da tela: Nariz < Orelha < Ombro em X?
            // Se olhando para esquerda, X diminui para a esquerda.
            // Forward Head: Orelha.x < Ombro.x (mais à esquerda)
            metrics.forwardHead = (s.leftEar.x - s.leftShoulder.x) * 100; // % diff
        }
    }

    // --- ANÁLISE DORSAL (POSTERIOR) ---
    if (landmarks.back) {
        const b = landmarks.back;
        
        // 1. Pronação de Tornozelo (Estimativa tendão calcâneo)
        // Requer pontos específicos no calcanhar que o MediaPipe Pose padrão não dá com precisão
        // Usamos Ankle e Heel se disponível, ou estimamos verticalidade da perna (Knee-Ankle)
        if (b.leftKnee && b.leftAnkle) {
            // Verticalidade da tíbia vista de trás
            const angle = Math.atan2(b.leftAnkle.x - b.leftKnee.x, b.leftAnkle.y - b.leftKnee.y) * (180/Math.PI);
            metrics.anklePronationEstimate = { ...metrics.anklePronationEstimate, left: angle } as any;
        }
    }

    return metrics;
};
