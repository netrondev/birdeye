export function uriencode(data: Record<string, string | undefined | number>) {
  let dataout: string[] = [];

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const thisdata = data[key];
      if (thisdata != undefined && thisdata !== "") {
        if (typeof thisdata === "number") {
          dataout.push(`${key}=${encodeURIComponent(thisdata)}`);
        } else {
          dataout.push(
            `${key}=${encodeURIComponent(thisdata.trim()).replace(/%20/g, "+")}`
          );
        }
      }
    }
  }

  return dataout.join("&");
}
