window.addEventListener("DOMContentLoaded", function () {
	var file=null, reg=/[\.gif|\.jpg|\.png]$/g;
	function chk(isSave){
		//*
		if (!_file) if (isSave) return false; else {alert("사진 파일을 지정해 주세요."); return false}
		reg.lastIndex=0;
		if (!reg.test(_file.name)) if (isSave) return false; else {alert("이미지는 gif, jpg, png 파일만 가능 합니다."); return false}
		if (_file.size > 512e3) if (isSave) return false; else {alert("파일 크기가 512Kbyte 이하만 가능 합니다."); return false}
		// */
		/*
		if (!_file) {alert("사진 파일을 지정해 주세요."); return false}
		reg.lastIndex=0;
		if (!reg.test(_file.name)) {alert("이미지는 gif, jpg, png 파일만 가능 합니다."); return false}
		if (_file.size > 512e3) {alert("파일 크기가 512Kbyte 이하만 가능 합니다."); return false}
		// */
		return true;
	}
	function image (url) {
		$(".file_thumb").css({
			"backgroundImage" : "url('" + url + "')"
		});
	}
	$("#btnCancel,.btn_close").on("click", function () {
		window.close();
	});
	$("#btnSave").on("click", function () {
		if (!chk(true)) {alert("사진 파일을 지정해 주세요."); return false}
		document.forms[0].submit();
	});

	var reader=null;
	if (window.FileReader) {
		reader=new FileReader();
		$(reader).on("load", function (e) {
			image(e.target.result);
		});
	}
	$("#filesearch2").on("change", function () {
		if ($(this).val()=="") return;
		_file = this.files[0];
		if (chk()) reader&&reader.readAsDataURL(_file);
		else {
			_file=null; $(this).val("");
			image("<계산된 값>/common/btn_upload.png");
		}
	});
	/*
	if ($("#filesearch2").val() !== "") {
		reader&&reader.readAsDataURL($("#filesearch2")[0].files[0]);
	}
	// */
});