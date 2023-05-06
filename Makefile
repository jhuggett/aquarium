compile:
	deno compile --unstable aquarium.ts

run:
	./run

compile_and_run:
	deno compile --unstable aquarium.ts && ./aquarium

compile_aarch64_apple:
	deno compile --unstable --output ./dist/aquarium-aarch64 --target aarch64-apple-darwin aquarium.ts

compile_x86_64_apple:
	deno compile --unstable --output ./dist/aquarium-x86_64 --target x86_64-apple-darwin aquarium.ts

compile_for_windows:
	deno compile --unstable --output ./dist/aquarium-windows --target x86_64-pc-windows-msvc aquarium.ts

compile_for_linux:
	deno compile --unstable --output ./dist/aquarium-linux --target x86_64-unknown-linux-gnu aquarium.ts

compile_for_all_targets: compile_aarch64_apple compile_x86_64_apple compile_for_windows compile_for_linux

