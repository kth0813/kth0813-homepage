import React from "react";
import "../css/App.css";

function PrivacyPolicy() {
  return (
    <div className="page-container policy-container">
      <div className="page-header">
        <div className="page-title-group">
          <h2 className="page-title">개인정보처리방침</h2>
          <p className="page-description">당사의 개인정보처리방침을 안내해 드립니다.</p>
        </div>
      </div>

      <div className="policy-content">
        <h3>1. 개인정보의 처리 목적</h3>
        <p>
          본 웹사이트는 회원가입, 고객상담, 서비스 제공 등을 위해 아래와 같은 개인정보를 수집하고 있습니다. 수집된 개인정보는 목적 이외의 용도로는 사용되지 않으며, 이용 목적이 변경될 시에는 사전
          동의를 구할 예정입니다.
        </p>

        <h3>2. 처리하는 개인정보의 항목</h3>
        <p>
          필수항목: 이름, 이메일 주소, 비밀번호 등<br />
          선택항목: 프로필 사진 등
        </p>

        <h3>3. 개인정보의 처리 및 보유 기간</h3>
        <p>이용자의 개인정보는 원칙적으로 개인정보의 처리 목적이 달성되면 지체 없이 파기합니다. 단, 관련 법령에 의하여 보존할 필요가 있는 경우 해당 기간 동안 보존합니다.</p>

        <h3>4. 제3자 제공 및 위탁</h3>
        <p>
          본 웹사이트는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로
          합니다.
          <br />
          <br />
          또한, 본 서비스는 YouTube API 서비스를 이용하고 있으며, 이용자는 본 서비스를 이용함으로써 YouTube 서비스 약관 (https://www.youtube.com/t/terms) 및 Google 개인정보처리방침
          (https://policies.google.com/privacy)에 동의하는 것으로 간주됩니다.
        </p>

        <h3>5. 이용자의 권리와 의무</h3>
        <p>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입해지를 요청할 수도 있습니다.</p>

        <h3>6. 개인정보 보호책임자</h3>
        <p>개인정보와 관련된 문의사항은 관리자에게 이메일로 연락하여 주시기 바랍니다.</p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
