{
  description = "A Nix-flake-based Node.js development environment";

  inputs.nixpkgs-unstable.url = "github:nixos/nixpkgs/nixos-unstable";
  inputs.nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1.*.tar.gz";

  outputs = { self, nixpkgs, nixpkgs-unstable }:
    let
      overlays = [
        (final: prev: rec {
          nodejs = prev.nodejs_latest;
          pnpm = prev.nodePackages.pnpm;
          yarn = (prev.yarn.override { inherit nodejs; });
        })
      ];
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forEachSupportedSystem = f: nixpkgs.lib.genAttrs supportedSystems (system: f {
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
          };
        };
        unstable = import nixpkgs-unstable {
          inherit system;
          config = {
            allowUnfree = true;
          };
        };
      });
    in
    {
      devShells = forEachSupportedSystem ({ pkgs, unstable }: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            node2nix
            nodejs
            pnpm
            yarn
            nodePackages.typescript-language-server
            unstable.claude-code
          ];
          shellHook = ''
            export PATH=$PATH:$PWD/node_modules/.bin
            export NVIM_PRETTIER_LSP=true
            export NVIM_TYPESCRIPT_LSP=true
          '';
        };
      });
    };
}
