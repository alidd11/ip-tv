import AVKit
import SwiftUI

struct PlayerView: View {
    let channel: TVChannel
    let source: PlaybackSource?

    @Environment(\.openURL) private var openURL
    @State private var player: AVPlayer?

    var body: some View {
        Group {
            if let source, source.playbackMode == "native", let url = URL(string: source.url) {
                VideoPlayer(player: player)
                    .ignoresSafeArea()
                    .onAppear {
                        let next = AVPlayer(url: url)
                        player = next
                        next.play()
                    }
                    .onDisappear {
                        player?.pause()
                        player = nil
                    }
            } else {
                VStack(spacing: 18) {
                    Text(channel.name)
                        .font(.largeTitle.bold())
                    Text(source?.requiresAuth == true ? "Subscription required" : "Open the official provider to watch.")
                        .foregroundStyle(.secondary)

                    if let source, let url = URL(string: source.url) {
                        Button("Open provider") {
                            openURL(url)
                        }
                        .buttonStyle(.borderedProminent)
                    }
                }
                .padding()
            }
        }
        .navigationTitle(channel.shortName)
        .navigationBarTitleDisplayMode(.inline)
    }
}
