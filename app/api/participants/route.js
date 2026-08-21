import { addParticipant, getAllParticipants, clearAllParticipants } from "@/lib/storage";

const RESET_PASSWORD = "123123";

export async function GET() {
  try {
    const data = await getAllParticipants();
    return Response.json({ ok: true, data });
  } catch (err) {
    return Response.json({ ok: false, error: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const raw = String(body?.number ?? "").trim().toUpperCase();
  const isTest = raw === "TEST";
  const num = Number(raw);
  const isValidNumber = Number.isInteger(num) && num >= 1 && num <= 33;

  if (!isTest && !isValidNumber) {
    return Response.json(
      { ok: false, error: "참가자 번호는 1~33 사이의 숫자 또는 TEST 만 입력할 수 있습니다." },
      { status: 400 }
    );
  }

  try {
    const result = await addParticipant(raw);
    return Response.json(result);
  } catch (err) {
    return Response.json({ ok: false, error: "등록 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const password = String(body?.password ?? "");
  if (password !== RESET_PASSWORD) {
    return Response.json({ ok: false, error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  try {
    await clearAllParticipants();
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: "초기화 중 오류가 발생했습니다." }, { status: 500 });
  }
}
