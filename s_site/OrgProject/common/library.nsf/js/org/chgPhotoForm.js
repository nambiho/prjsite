window.addEventListener("DOMContentLoaded", function () {
	var file=null, reg=/[\.gif|\.jpg|\.png]$/g;
	function chk(isSave){
		//*
		if (!_file) if (isSave) return false; else {alert("���� ������ ������ �ּ���."); return false}
		reg.lastIndex=0;
		if (!reg.test(_file.name)) if (isSave) return false; else {alert("�̹����� gif, jpg, png ���ϸ� ���� �մϴ�."); return false}
		if (_file.size > 512e3) if (isSave) return false; else {alert("���� ũ�Ⱑ 512Kbyte ���ϸ� ���� �մϴ�."); return false}
		// */
		/*
		if (!_file) {alert("���� ������ ������ �ּ���."); return false}
		reg.lastIndex=0;
		if (!reg.test(_file.name)) {alert("�̹����� gif, jpg, png ���ϸ� ���� �մϴ�."); return false}
		if (_file.size > 512e3) {alert("���� ũ�Ⱑ 512Kbyte ���ϸ� ���� �մϴ�."); return false}
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
		if (!chk(true)) {alert("���� ������ ������ �ּ���."); return false}
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
			image("<���� ��>/common/btn_upload.png");
		}
	});
	/*
	if ($("#filesearch2").val() !== "") {
		reader&&reader.readAsDataURL($("#filesearch2")[0].files[0]);
	}
	// */
});