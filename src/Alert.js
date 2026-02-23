import Swal from "sweetalert2";

// 1. 단순 메시지 알림 (제목/아이콘 없이 내용만)
export const showAlert = (text) => {
  return Swal.fire({ text: text, confirmButtonColor: "#333", confirmButtonText: "확인" });
};

// 2. 가벼운 토스트 알림 (하단이나 상단에 짧게 지나가는 텍스트)
export const showToast = (text) => {
  const Toast = Swal.mixin({ toast: true, position: "top", showConfirmButton: false, timer: 1500, background: "#333", color: "#fff" });

  Toast.fire({
    text: text
  });
};

// 3. 확인창 (질문이나 아이콘 없이 텍스트만)
export const showConfirm = async (text) => {
  const result = await Swal.fire({ text: text, showCancelButton: true, confirmButtonColor: "#333", cancelButtonColor: "#999", confirmButtonText: "확인", cancelButtonText: "취소" });

  return result.isConfirmed;
};
