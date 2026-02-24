import Swal from "sweetalert2";

export const showAlert = (message, title = "", icon = "warning") => {
  return Swal.fire({ text: message, title: title, icon: icon, confirmButtonColor: "#333", confirmButtonText: "확인" });
};

export const showToast = (message, icon = "success") => {
  const Toast = Swal.mixin({ toast: true, position: "top", showConfirmButton: false, timer: 1500, background: "#333", color: "#fff" });

  Toast.fire({
    icon: icon,
    text: message
  });
};

export const showConfirm = async (message) => {
  const result = await Swal.fire({ text: message, showCancelButton: true, confirmButtonColor: "#333", cancelButtonColor: "#999", confirmButtonText: "확인", cancelButtonText: "취소" });

  return result.isConfirmed;
};
