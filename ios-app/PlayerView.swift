import AVKit
import SwiftUI

/// Native AVPlayer surface with in-app channel switching for authorised HLS.
struct PlayerView: View {
    let channel: TVChannel
    @ObservedObject var catalogue: CatalogueStore

    @Environment(\.openURL) private var openURL
    @State private var player: AVPlayer?
    @State private var selected: TVChannel

    init(channel: TVChannel, catalogue: CatalogueStore) {
        self.channel = channel
        self.catalogue = catalogue
        _selected = State(initialValue: channel)
    }

    private var playable: [TVChannel] {
        catalogue.nativeChannelQueue(for: selected.country)
    }

    private var approvedStream: PlaybackSource? {
        catalogue.nativeHlsSource(for: selected)
    }

    var body: some View {
        VStack(spacing: 0) {
            if approvedStream != nil {
                VideoPlayer(player: player)
                    .aspectRatio(16 / 9, contentMode: .fit)
                    .frame(maxWidth: .infinity)
                    .accessibilityLabel("Live television: " + selected.name)
            } else {
                VStack(spacing: 14) {
                    Image(systemName: "tv")
                        .font(.system(size: 46))
                    Text("Not playable inside IP TV")
                        .font(.title3.bold())
                    Text("This channel currently has no approved direct stream. The broadcaster may offer viewing through its official service.")
                        .font(.subheadline)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 24)
                    if let source = catalogue.source(for: selected),
                       let url = URL(string: source.url),
                       url.scheme == "https",
                       source.playbackMode == "handoff" || source.playbackMode == "external" {
                        Button(source.playbackMode == "handoff" ? "View subscription" : "Open official broadcaster") {
                            openURL(url)
                        }
                        .buttonStyle(.borderedProminent)
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }

            VStack(spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("IP TV · LIVE")
                            .font(.caption2.bold())
                            .tracking(1.3)
                            .foregroundStyle(.purple)
                        Text(selected.name)
                            .font(.title3.weight(.semibold))
                            .lineLimit(1)
                    }
                    Spacer(minLength: 8)
                    Text(channelCounter)
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(.secondary)
                }

                HStack(spacing: 12) {
                    Button {
                        changeChannel(-1)
                    } label: {
                        Label("Previous", systemImage: "backward.end.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .disabled(playable.count < 2)
                    .buttonStyle(.bordered)

                    Button {
                        changeChannel(1)
                    } label: {
                        Label("Next", systemImage: "forward.end.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .disabled(playable.count < 2)
                    .buttonStyle(.bordered)
                }
            }
            .padding(18)
            .background(Color(red: 0.065, green: 0.073, blue: 0.12))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(.black)
        .foregroundStyle(.white)
        .navigationTitle(selected.shortName)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear(perform: playSelected)
        .onChange(of: selected.id) { _, _ in playSelected() }
        .onDisappear(perform: releasePlayer)
    }

    private var channelCounter: String {
        guard let position = playable.firstIndex(where: { $0.id == selected.id }) else {
            return "Source unavailable"
        }
        return String(position + 1) + " / " + String(playable.count)
    }

    private func changeChannel(_ step: Int) {
        guard playable.count > 1 else { return }
        let index = playable.firstIndex(where: { $0.id == selected.id }) ?? 0
        selected = playable[(index + step + playable.count) % playable.count]
    }

    private func playSelected() {
        releasePlayer()
        guard let source = approvedStream, let url = URL(string: source.url),
              url.scheme == "https" else { return }
        let next = AVPlayer(url: url)
        player = next
        next.play()
    }

    private func releasePlayer() {
        player?.pause()
        player?.replaceCurrentItem(with: nil)
        player = nil
    }
}
