import Link from 'next/link';

export default async function Result({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {

    const { timeBlocks, energyLevel } = await searchParams;

  return (
    
    <div className="min-h-screen w-full bg-fixed bg-cover relative">

      {/* Background */}
      <div className=" bg-[linear-gradient(to_right,#73737320_1px,transparent_1px),linear-gradient(to_bottom,#73737320_1px,transparent_1px)] bg-size-[20px_20px]"/>        
      <div className="absolute -z-10 inset-0 h-full w-full bg-fixed bg-[linear-gradient(to_right,#73737320_1px,transparent_1px),linear-gradient(to_bottom,#73737320_1px,transparent_1px)] bg-size-[20px_20px]" />

      {/* Main */}
      <main className="mx-auto flex-col min-h-screen w-full max-w-3xl items-center justify-between py-10 px-16 sm:items-start">

        <div className="flex flex-col justify-center items-center gap-10 text-center sm:text-left">

          {/* Title */}
          <h6 className="text-6xl text-[#628141] text-shadow-[#254F22] text-shadow-lg font-custom-zendots">AI Daily Planner</h6>

          {/* Display Retrieved Data */}
          <div>Time Blocks: {timeBlocks}</div>
          <div>Energy Level: {energyLevel}</div>

          {/* Try Again Button */}
          <Link href='/'>
            <button className="font-custom-zendots relative p-0.5 inline-flex items-center justify-center font-bold overflow-hidden group rounded-md">
              <span className="w-full h-full bg-linear-to-br from-[#628141] via-[#8BAE66] to-[#1B211A] group-hover:from-[#1B211A] group-hover:via-[#8BAE66] group-hover:to-[#628141] absolute"></span>
                <span className="relative px-6 py-3 transition-all ease-out bg-white/10 backdrop-blur-sm rounded-md group-hover:bg-opacity-0 duration-400">
                <span className="relative text-[#222222]">Try Again</span>
              </span>
            </button>
          </Link>

        </div>
      </main>
    </div>
  );
}