// Regenerates themes/jaime/assets/og/base.png — a 1200x630 solid-dark
// canvas with a 2px inner border. The Hugo build does not invoke this;
// it's kept here so the base image can be reproduced from source if the
// palette tokens in hugo.toml ever change.
//
//	go run scripts/make-og-base.go themes/jaime/assets/og/base.png
package main

import (
	"fmt"
	"image"
	"image/color"
	"image/png"
	"os"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "usage: go run scripts/make-og-base.go <output.png>")
		os.Exit(2)
	}
	w, h := 1200, 630
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	bg := color.RGBA{0x0b, 0x0b, 0x0d, 0xff}
	border := color.RGBA{0x1e, 0x1e, 0x22, 0xff}
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			img.Set(x, y, bg)
		}
	}
	inset := 40
	for x := inset; x < w-inset; x++ {
		img.Set(x, inset, border)
		img.Set(x, inset+1, border)
		img.Set(x, h-inset-1, border)
		img.Set(x, h-inset-2, border)
	}
	for y := inset; y < h-inset; y++ {
		img.Set(inset, y, border)
		img.Set(inset+1, y, border)
		img.Set(w-inset-1, y, border)
		img.Set(w-inset-2, y, border)
	}
	f, err := os.Create(os.Args[1])
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	defer f.Close()
	if err := png.Encode(f, img); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
