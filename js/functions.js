/*
*
* Centra verticalmente una ventana modal
*
*/
function reposition(modal) {
	dialog = modal.find('.modal-dialog');
	modal.css('display', 'block');
	
	// Dividing by two centers the modal exactly, but dividing by three 
	// or four works better for larger screens.
	dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
}