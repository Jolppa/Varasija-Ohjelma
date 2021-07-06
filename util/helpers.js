exports.päivitetty_viimeksi = (vanha_aika, nykyinen_aika) => {
  let vanha_aika_arr = vanha_aika.split(", ");
  let nykyinen_aika_arr = nykyinen_aika.split(", ");
  let vanha_päivät_arr = vanha_aika_arr[0].split(".");
  let nykyinen_päivät_arr = nykyinen_aika_arr[0].split(".");
  let vanha_tunnit_arr = vanha_aika_arr[1].split(":");
  let nykyinen_tunnit_arr = nykyinen_aika_arr[1].split(":");
  //   console.log(vanha_tunnit_arr, nykyinen_tunnit_arr);

  let erotus_päivät = new Array(3).fill().map((elem, i) => {
    return Number(nykyinen_päivät_arr[i]) - Number(vanha_päivät_arr[i]);
  });
  let erotus_tunnit = new Array(3).fill().map((elem, i) => {
    return Number(nykyinen_tunnit_arr[i]) - Number(vanha_tunnit_arr[i]);
  });

  console.log(erotus_päivät, erotus_tunnit);
  //   return `${erotus_päivät[0]}`
};
