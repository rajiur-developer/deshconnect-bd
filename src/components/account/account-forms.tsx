"use client";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import { sendMessageAction, updateProfileAction, type AccountFormState } from "@/features/account/actions"; import { PROFILE_IMAGE_BUCKET, PROFILE_IMAGE_MAX_BYTES, PROFILE_IMAGE_TYPES } from "@/features/account/constants"; import { Button } from "@/components/ui/button"; import { Field, Input, Textarea } from "@/components/ui/input"; import { LocationFields } from "@/components/forms/location-fields"; import { useFormStateToast } from "@/components/ui/toast"; import type { DistrictOption, LocationOption, UpazilaOption } from "@/components/search/directory-filters"; import { Icon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/spinner";
type LocationProps = {
divisions: LocationOption[];
districts: DistrictOption[];
upazilas: UpazilaOption[]; };
type ProfileProps = LocationProps & {
userId: string;
initial: {
fullName: string;
bio?: string;
phone?: string;
avatar?: string;
divisionId?: string;
districtId?: string;
upazilaId?: string;
}; };
export function ProfileEditForm({ userId, divisions, districts, upazilas, initial }: ProfileProps) {
const [state, formAction, pending] = useActionState<AccountFormState, FormData>(updateProfileAction, {});
const [uploading, setUploading] = useState(false);
const [uploadError, setUploadError] = useState("");
const [preview, setPreview] = useState(initial.avatar ?? "");
const formRef = useRef<HTMLFormElement>(null);
const fileRef = useRef<HTMLInputElement>(null);
const avatarUrlRef = useRef<HTMLInputElement>(null);
const avatarKeyRef = useRef<HTMLInputElement>(null);
const avatarMimeRef = useRef<HTMLInputElement>(null);
const avatarSizeRef = useRef<HTMLInputElement>(null);
const submitAfterUpload = useRef(false);
const uploadInProgress = useRef(false);
useFormStateToast(state);
useEffect(() => { setPreview(initial.avatar ?? ""); }, [initial.avatar]);
function safeFilename(name: string) { return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100) || "profile-image"; }
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
if (submitAfterUpload.current) { submitAfterUpload.current = false; return; }
const file = fileRef.current?.files?.[0];
if (!file) return;
event.preventDefault();
if (uploadInProgress.current) return;
setUploadError("");
if (!PROFILE_IMAGE_TYPES.includes(file.type as (typeof PROFILE_IMAGE_TYPES)[number])) { setUploadError("Choose a JPG, JPEG, or PNG image."); return; }
if (file.size < 1 || file.size > PROFILE_IMAGE_MAX_BYTES) { setUploadError("The image must be 5 MB or smaller."); return; }
uploadInProgress.current = true;
setUploading(true);
try {
const client = getInsForgeBrowserClient();
const key = `${userId}/${crypto.randomUUID()}-${safeFilename(file.name)}`;
const { data, error } = await client.storage.from(PROFILE_IMAGE_BUCKET).upload(key, file);
if (error || !data?.url || !data?.key) { setUploadError("Image upload failed. Please try again."); return; }
if (avatarUrlRef.current) avatarUrlRef.current.value = data.url;
if (avatarKeyRef.current) avatarKeyRef.current.value = data.key;
if (avatarMimeRef.current) avatarMimeRef.current.value = file.type;
if (avatarSizeRef.current) avatarSizeRef.current.value = String(file.size);
setPreview(URL.createObjectURL(file));
if (fileRef.current) fileRef.current.value = "";
submitAfterUpload.current = true;
formRef.current?.requestSubmit();
} catch { setUploadError("Image upload failed. Please try again."); }
finally { uploadInProgress.current = false; setUploading(false); }
}
return (
<form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
<div className="grid gap-4 sm:grid-cols-2">
<Field label="Full name" htmlFor="fullName" required>
<Input id="fullName" name="fullName" defaultValue={initial.fullName} required />
</Field>
<Field label="Phone" htmlFor="phone" hint="Optional">
<Input id="phone" name="phone" defaultValue={initial.phone ?? ""} placeholder="01712345678" />
</Field>
</div>
<Field label="Bio" htmlFor="bio" hint="Optional">
<Textarea id="bio" name="bio" defaultValue={initial.bio ?? ""} />
</Field>
<div>
<p className="mb-1.5 text-sm font-medium text-slate-700">Profile picture</p>
<div className="flex items-center gap-4">
{preview && <img src={preview} alt="Profile picture preview" className="h-14 w-14 rounded-full border border-slate-200 object-cover" />}
<input ref={fileRef} id="profile-picture" name="profile-picture" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-medium file:text-brand-700 hover:file:bg-brand-100" />
</div>
<p className="mt-1 text-xs text-slate-500">JPG, JPEG, or PNG · max 5 MB.</p>
</div>
<input ref={avatarUrlRef} type="hidden" name="avatar" />
<input ref={avatarKeyRef} type="hidden" name="avatar_key" />
<input ref={avatarMimeRef} type="hidden" name="avatar_mime_type" />
<input ref={avatarSizeRef} type="hidden" name="avatar_size" />
<LocationFields
divisions={divisions}
districts={districts}
upazilas={upazilas}
current={{
divisionId: initial.divisionId,
districtId: initial.districtId,
upazilaId: initial.upazilaId,
}}
/>
{(state.error || uploadError) && <p role="alert" className="text-sm text-accent-600">{uploadError || state.error}</p>}
{state.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
<Button type="submit" disabled={pending || uploading}>{uploading ? "Uploading…" : pending ? "Saving…" : "Save changes"}</Button>
</form>
); }
function createVoiceWav(chunks: Float32Array[], sourceRate: number): Blob {
const sampleCount = chunks.reduce((total, chunk) => total + chunk.length, 0);
const outputRate = 16_000;
const outputCount = Math.floor(sampleCount * outputRate / sourceRate);
const buffer = new ArrayBuffer(44 + outputCount * 2);
const view = new DataView(buffer);
const writeText = (offset: number, value: string) => {
for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
};
writeText(0, "RIFF");
view.setUint32(4, 36 + outputCount * 2, true);
writeText(8, "WAVE");
writeText(12, "fmt ");
view.setUint32(16, 16, true);
view.setUint16(20, 1, true);
view.setUint16(22, 1, true);
view.setUint32(24, outputRate, true);
view.setUint32(28, outputRate * 2, true);
view.setUint16(32, 2, true);
view.setUint16(34, 16, true);
writeText(36, "data");
view.setUint32(40, outputCount * 2, true);
let sourceOffset = 0;
let chunkIndex = 0;
let chunkOffset = 0;
for (let index = 0; index < outputCount; index += 1) {
const start = Math.floor(index * sourceRate / outputRate);
const end = Math.min(sampleCount, Math.max(start + 1, Math.floor((index + 1) * sourceRate / outputRate)));
while (sourceOffset < start && chunkIndex < chunks.length) {
sourceOffset += 1;
chunkOffset += 1;
if (chunkOffset >= chunks[chunkIndex].length) { chunkIndex += 1; chunkOffset = 0; }
}
let total = 0;
let count = 0;
while (sourceOffset < end && chunkIndex < chunks.length) {
total += chunks[chunkIndex][chunkOffset] ?? 0;
count += 1;
sourceOffset += 1;
chunkOffset += 1;
if (chunkOffset >= chunks[chunkIndex].length) { chunkIndex += 1; chunkOffset = 0; }
}
const sample = Math.max(-1, Math.min(1, count ? total / count : 0));
view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
}
return new Blob([buffer], { type: "audio/wav" });
}

export function MessageForm({ conversationId, viewerId, onMessageSent }: { conversationId: string; viewerId: string; onMessageSent?: (message: { id: string; conversationId: string; senderId: string; body: string; attachmentKey: string | null; attachmentUrl: string | null; attachmentMimeType: string | null; attachmentType: "image" | "audio" | null; createdAt: string; readBy: string[] }) => void }) {
const [body, setBody] = useState("");
const [file, setFile] = useState<File | null>(null);
const [pending, setPending] = useState(false);
const [recording, setRecording] = useState(false);
const [recordingSeconds, setRecordingSeconds] = useState(0);
const [messageFocused, setMessageFocused] = useState(false);
const [filePreviewUrl, setFilePreviewUrl] = useState("");
const [error, setError] = useState("");
const [replyingTo, setReplyingTo] = useState<{ messageId: string; senderName: string; body: string } | null>(null);
const imageRef = useRef<HTMLInputElement>(null);
const audioRef = useRef<HTMLInputElement>(null);
const streamRef = useRef<MediaStream | null>(null);
const audioContextRef = useRef<AudioContext | null>(null);
const analyserRef = useRef<AnalyserNode | null>(null);
const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
const processorRef = useRef<ScriptProcessorNode | null>(null);
const gainRef = useRef<GainNode | null>(null);
const audioSamplesRef = useRef<Float32Array[]>([]);
const audioSampleCountRef = useRef(0);
const animationFrameRef = useRef<number | null>(null);
const waveformBarsRef = useRef<(HTMLSpanElement | null)[]>([]);
const MAX_CHAT_MEDIA_BYTES = 5 * 1024 * 1024;
useEffect(() => () => {
if (processorRef.current) { processorRef.current.onaudioprocess = null; processorRef.current.disconnect(); }
sourceRef.current?.disconnect();
gainRef.current?.disconnect();
streamRef.current?.getTracks().forEach((track) => track.stop());
if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
if (audioContextRef.current && audioContextRef.current.state !== "closed") void audioContextRef.current.close();
}, []);
useEffect(() => {
if (!file) { setFilePreviewUrl(""); return; }
const url = URL.createObjectURL(file);
setFilePreviewUrl(url);
return () => URL.revokeObjectURL(url);
}, [file]);
useEffect(() => {
if (!recording) return;
const timer = window.setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000);
return () => window.clearInterval(timer);
}, [recording]);
useEffect(() => {
const handleReply = (event: Event) => {
const detail = (event as CustomEvent<{ conversationId: string; messageId: string; senderName: string; body: string }>).detail;
if (detail?.conversationId !== conversationId) return;
setReplyingTo({ messageId: detail.messageId, senderName: detail.senderName, body: detail.body });
setBody("");
setError("");
};
window.addEventListener("chat-reply-requested", handleReply);
return () => window.removeEventListener("chat-reply-requested", handleReply);
}, [conversationId]);
function stopVoiceRecording(discard = false) {
const audioContext = audioContextRef.current;
const processor = processorRef.current;
if (!audioContext || !processor) return;
processor.onaudioprocess = null;
processor.disconnect();
sourceRef.current?.disconnect();
gainRef.current?.disconnect();
processorRef.current = null;
sourceRef.current = null;
gainRef.current = null;
const samples = audioSamplesRef.current;
audioSamplesRef.current = [];
audioSampleCountRef.current = 0;
if (!discard) {
const blob = createVoiceWav(samples, audioContext.sampleRate);
if (blob.size > MAX_CHAT_MEDIA_BYTES) {
setError("Voice message is over the 5 MB limit. Please record a shorter clip.");
} else if (blob.size > 44) {
setFile(new File([blob], "voice-message.wav", { type: "audio/wav" }));
} else {
setError("No audio was recorded. Please try again.");
}
}
if (imageRef.current) imageRef.current.value = "";
if (audioRef.current) audioRef.current.value = "";
streamRef.current?.getTracks().forEach((track) => track.stop());
streamRef.current = null;
analyserRef.current = null;
if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
animationFrameRef.current = null;
audioContextRef.current = null;
if (audioContext.state !== "closed") void audioContext.close();
waveformBarsRef.current.forEach((bar) => bar?.style.setProperty("--recording-level", "0.12"));
setRecording(false);
setRecordingSeconds(0);
}
async function toggleVoiceRecording() {
setError("");
if (recording) { stopVoiceRecording(); return; }
if (!window.AudioContext || !navigator.mediaDevices?.getUserMedia) {
setError("Voice recording is not supported in this browser. Choose an audio recording instead."); return;
}
try {
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
streamRef.current = stream;
const audioContext = new window.AudioContext();
audioContextRef.current = audioContext;
await audioContext.resume();
const source = audioContext.createMediaStreamSource(stream);
const analyser = audioContext.createAnalyser();
analyser.fftSize = 512;
const processor = audioContext.createScriptProcessor(4096, 1, 1);
const silentOutput = audioContext.createGain();
silentOutput.gain.value = 0;
source.connect(analyser);
source.connect(processor);
processor.connect(silentOutput);
silentOutput.connect(audioContext.destination);
sourceRef.current = source;
analyserRef.current = analyser;
processorRef.current = processor;
gainRef.current = silentOutput;
audioSamplesRef.current = [];
audioSampleCountRef.current = 0;
processor.onaudioprocess = (event) => {
const input = event.inputBuffer.getChannelData(0);
const maxSamples = Math.floor(((MAX_CHAT_MEDIA_BYTES - 44) / 2) * audioContext.sampleRate / 16_000);
const remaining = maxSamples - audioSampleCountRef.current;
if (remaining <= 0) {
setError("Recording stopped at the 5 MB attachment limit.");
stopVoiceRecording();
return;
}
const captured = input.slice(0, remaining);
audioSamplesRef.current.push(captured);
audioSampleCountRef.current += captured.length;
if (captured.length < input.length) {
setError("Recording stopped at the 5 MB attachment limit.");
stopVoiceRecording();
}
};
const samples = new Uint8Array(analyser.fftSize);
let smoothedLevel = 0;
const updateWaveform = () => {
const activeAnalyser = analyserRef.current;
if (!activeAnalyser) return;
activeAnalyser.getByteTimeDomainData(samples);
const rms = Math.sqrt(samples.reduce((sum, sample) => sum + ((sample - 128) / 128) ** 2, 0) / samples.length);
const targetLevel = Math.max(0, Math.min(1, (rms - 0.008) * 8));
smoothedLevel = targetLevel > smoothedLevel
? smoothedLevel * 0.35 + targetLevel * 0.65
: smoothedLevel * 0.82 + targetLevel * 0.18;
const time = performance.now() / 250;
waveformBarsRef.current.forEach((bar, index) => {
if (!bar) return;
const barMotion = 0.45 + Math.abs(Math.sin(time + index * 0.8)) * 0.55;
bar.style.setProperty("--recording-level", String(0.12 + smoothedLevel * barMotion * 0.88));
});
animationFrameRef.current = window.requestAnimationFrame(updateWaveform);
};
updateWaveform();
setFile(null);
setRecordingSeconds(0);
setRecording(true);
if (imageRef.current) imageRef.current.value = "";
if (audioRef.current) audioRef.current.value = "";
} catch (cause) {
streamRef.current?.getTracks().forEach((track) => track.stop());
streamRef.current = null;
analyserRef.current = null;
if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
animationFrameRef.current = null;
if (audioContextRef.current && audioContextRef.current.state !== "closed") void audioContextRef.current.close();
audioContextRef.current = null;
const errorName = cause instanceof DOMException ? cause.name : "";
if (errorName === "NotAllowedError" || errorName === "SecurityError") {
setError("Microphone access was blocked. Allow microphone access in your browser settings, then try again.");
} else if (errorName === "NotFoundError" || errorName === "OverconstrainedError") {
setError("No usable microphone was found. Connect or enable a microphone, then try again.");
} else if (errorName === "NotReadableError") {
setError("The microphone is busy in another app. Close other apps using it, then try again.");
} else {
setError(cause instanceof Error ? `Could not start voice recording: ${cause.message}` : "Could not start voice recording. Check your microphone and try again.");
}
}
}
function cancelAttachment() {
if (recording) {
stopVoiceRecording(true);
} else {
setFile(null);
}
if (imageRef.current) imageRef.current.value = "";
if (audioRef.current) audioRef.current.value = "";
setError("");
}
async function submitMessage(event: FormEvent<HTMLFormElement>) {
event.preventDefault();
if (pending) return;
if (!body.trim() && !file) return;
const messageBody = body.trim();
const selectedFile = file;
const replyToMessageId = replyingTo?.messageId ?? null;
const optimisticId = crypto.randomUUID();
const optimisticMime = selectedFile?.type.toLowerCase().split(";")[0] ?? "";
const optimisticType = optimisticMime.startsWith("image/") ? "image" : optimisticMime.startsWith("audio/") ? "audio" : null;
window.dispatchEvent(new CustomEvent("chat-message-optimistic", { detail: {
id: optimisticId, conversationId, senderId: viewerId, body: messageBody, readBy: [viewerId], deliveredTo: [],
attachmentKey: null, attachmentUrl: null, attachmentMimeType: optimisticMime || null, attachmentType: optimisticType,
replyToMessageId, reactions: [], createdAt: new Date().toISOString(), deliveryState: "sending",
optimisticAttachmentType: optimisticType,
} }));
setBody("");
setFile(null);
setReplyingTo(null);
if (imageRef.current) imageRef.current.value = "";
if (audioRef.current) audioRef.current.value = "";
setPending(true); setError("");
let uploadedKey: string | undefined;
try {
let attachment: { key: string; url: string; mimeType: string; type: "image" | "audio" } | undefined;
if (selectedFile) {
if (selectedFile.size < 1 || selectedFile.size > MAX_CHAT_MEDIA_BYTES) throw new Error("Images and voice messages must be 5 MB or smaller.");
const mimeType = selectedFile.type.toLowerCase().split(";")[0];
const type = mimeType.startsWith("image/") ? "image" : mimeType.startsWith("audio/") ? "audio" : null;
const allowed = new Set(["image/jpeg", "image/png", "image/webp", "audio/webm", "audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/aac", "audio/x-wav"]);
if (!type || !allowed.has(mimeType)) throw new Error("Choose an image or audio recording. Other file types are not supported.");
const extension = selectedFile.name.split(".").pop()?.toLowerCase() || (type === "image" ? "jpg" : "webm");
const key = `${viewerId}/${conversationId}/${crypto.randomUUID()}.${extension}`;
const client = getInsForgeBrowserClient();
const { data: upload, error: uploadError } = await client.storage.from("record-attachments").upload(key, selectedFile);
if (uploadError) throw new Error(uploadError.message || "The attachment could not be uploaded. Check your connection and try again.");
uploadedKey = key;
if (!upload?.url) throw new Error("The attachment uploaded, but its link could not be saved. Please try again.");
attachment = { key, url: upload.url, mimeType, type };
}
const result = await sendMessageAction(conversationId, messageBody, attachment, replyToMessageId);
if (!result.ok) {
if (uploadedKey) await getInsForgeBrowserClient().storage.from("record-attachments").remove(uploadedKey);
uploadedKey = undefined;
throw new Error(result.error || "The message could not be sent.");
}
uploadedKey = undefined;
if (!result.message) throw new Error("The message was sent, but its delivery status could not be confirmed.");
onMessageSent?.(result.message);
window.dispatchEvent(new CustomEvent("chat-message-sent", { detail: { ...result.message, clientMessageId: optimisticId } }));
uploadedKey = undefined;
} catch (cause) {
if (uploadedKey) await getInsForgeBrowserClient().storage.from("record-attachments").remove(uploadedKey);
const message = cause instanceof Error ? cause.message : "The message could not be sent. Please try again.";
window.dispatchEvent(new CustomEvent("chat-message-send-failed", { detail: { id: optimisticId, conversationId } }));
setBody((current) => current || messageBody);
if (selectedFile) setFile(selectedFile);
if (replyToMessageId && replyingTo) setReplyingTo(replyingTo);
setError(message);
} finally { setPending(false); }
}
return (
<form onSubmit={submitMessage} className={`space-y-2 rounded-lg ${error ? "motion-error" : ""}`}>
{replyingTo && <div className="flex items-start justify-between gap-3 rounded-lg border-l-2 border-brand-500 bg-brand-50 px-3 py-2 text-xs text-slate-600"><p className="min-w-0"><span className="font-semibold text-slate-800">Replying to {replyingTo.senderName}</span><br /><span className="block truncate">{replyingTo.body}</span></p><button type="button" onClick={() => setReplyingTo(null)} className="shrink-0 text-slate-500 underline">Cancel</button></div>}
{recording && <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
<span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-red-600" aria-hidden="true" />
<span className="font-medium">Recording {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}</span>
<span className="flex h-6 flex-1 items-center justify-center gap-1" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((bar) => <span key={bar} ref={(element) => { waveformBarsRef.current[bar] = element; }} className="chat-recording-bar" />)}</span>
<button type="button" onClick={() => stopVoiceRecording()} className="rounded-md px-2 py-1 text-xs font-semibold hover:bg-red-100" aria-label="Stop recording">Stop</button>
<button type="button" onClick={cancelAttachment} className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-red-100" aria-label="Cancel voice recording" title="Cancel recording"><Icon name="close" className="h-4 w-4" /></button>
</div>}
{file && <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
{file.type.startsWith("image/") && filePreviewUrl
? <img src={filePreviewUrl} alt="Selected image preview" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
: <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700"><Icon name="audio" className="h-5 w-5" /></span>}
<div className="min-w-0 flex-1">
<p className="text-xs font-semibold text-slate-800">{file.type.startsWith("image/") ? "Image preview" : "Voice message preview"} <span className="font-normal text-slate-500">· max 5 MB</span></p>
{file.type.startsWith("audio/") && filePreviewUrl
? <audio controls preload="metadata" src={filePreviewUrl} className="mt-1 h-9 w-full max-w-xs" aria-label="Preview voice message" />
: file.type.startsWith("image/") ? null : <p className="mt-1 truncate text-xs text-slate-500" title={file.name}>{file.name}</p>}
</div>
<button type="button" onClick={cancelAttachment} disabled={pending} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-red-100 hover:text-red-700 disabled:opacity-50" aria-label="Remove attachment" title="Remove attachment"><Icon name="close" className="h-4 w-4" /></button>
</div>}
<div className="flex items-center gap-2">
{!messageFocused && !recording && <div className="flex shrink-0 items-center gap-1">
<button type="button" onClick={() => imageRef.current?.click()} disabled={pending} aria-label="Choose image" title="Choose image (max 5 MB)" className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-60">
<Icon name="image" className="h-5 w-5" />
</button>
<input ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={pending} onChange={(event) => { const selected = event.target.files?.[0] ?? null; setFile(selected); setError(""); if (selected && audioRef.current) audioRef.current.value = ""; }} />
<button type="button" onClick={() => audioRef.current?.click()} disabled={pending} aria-label="Choose voice recording" title="Choose voice recording (max 5 MB)" className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-60">
<Icon name="audio" className="h-5 w-5" />
</button>
<input ref={audioRef} type="file" accept="audio/*" className="sr-only" disabled={pending} onChange={(event) => { const selected = event.target.files?.[0] ?? null; setFile(selected); setError(""); if (selected && imageRef.current) imageRef.current.value = ""; }} />
<button type="button" onClick={toggleVoiceRecording} disabled={pending} aria-label={recording ? "Stop voice recording" : "Record voice"} title={recording ? "Stop recording" : "Record voice (max 5 MB)"} className={`grid h-9 w-9 place-items-center rounded-lg disabled:opacity-60 ${recording ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"}`}>
<Icon name={recording ? "stop" : "mic"} className="h-5 w-5" />
</button>
</div>}
<Input value={body} onChange={(event) => setBody(event.target.value)} onFocus={() => setMessageFocused(true)} onBlur={() => setMessageFocused(false)} placeholder="Write a message…" aria-label="Message" className="min-w-0 flex-1" maxLength={2000} disabled={pending} />
<Button type="submit" disabled={pending || recording || (!body.trim() && !file)} aria-busy={pending}>{pending && <Spinner />}{pending ? "Sending…" : "Send"}</Button>
</div>
{error && <p role="alert" className="text-xs text-accent-600">{error}</p>}
</form>
); }
