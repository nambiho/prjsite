
window.addEventListener("DOMContentLoaded", function () {
	$("#btnCancel,.btn_close").on("click", function () {
		window.close();
	});
	$("#btnSave").on("click", function () {
		if ($("#filesearch2").val() === "") {alert("사진 파일을 지정해 주세요."); return false}
		document.forms[0].submit();
		//window.close();
	});
	var reader=null;
	if (window.FileReader) {
		reader=new FileReader();
		$(reader).on("load", function (e) {
			$(".file_thumb").css({
				"backgroundImage" : "url('" + e.target.result + "')"
			});
		});
	}
	$("#filesearch2").on("change", function () {
		var _file = this.files[0],
		reg=/[\.gif|\.jpg|\.png]$/g;

		if (!_file) return;
		if (!reg.test(_file.name)) {alert("이미지는 gif, jpg, png 파일만 가능 합니다."); return false}
		if (_file.size > 512e3) {alert("파일 크기가 512Kbyte 이하만 가능 합니다."); return false}
		reader&&reader.readAsDataURL(_file);
	});
	if ($("#filesearch2").val() !== "") {
		reader&&reader.readAsDataURL($("#filesearch2")[0].files[0]);
	}
});
