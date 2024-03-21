export const isLetter=(event:any)=>{
  const keyCode = event.keyCode || event.charCode;
  if ((keyCode >= 65 && keyCode <= 90) || // A-Z
      (keyCode >= 97 && keyCode <= 122)) { // a-z
      return true;
  } else {
      return false;
  }
}