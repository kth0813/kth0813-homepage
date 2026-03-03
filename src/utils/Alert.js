import Swal from "sweetalert2";

export const showAlert = (message, title = "") => {
  return Swal.fire({ text: message, title: title, confirmButtonColor: "#333", confirmButtonText: "확인" });
};

export const showToast = (message) => {
  const Toast = Swal.mixin({ toast: true, position: "top", showConfirmButton: false, timer: 1500, background: "#333", color: "#fff" });
  Toast.fire({ text: message });
};

export const showConfirm = async (message) => {
  const result = await Swal.fire({ text: message, showCancelButton: true, confirmButtonColor: "#333", cancelButtonColor: "#999", confirmButtonText: "확인", cancelButtonText: "취소" });
  return result.isConfirmed;
};
