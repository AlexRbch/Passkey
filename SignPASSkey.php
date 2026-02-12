<?php
error_reporting(E_ALL);
session_start();
header('Content-Type: application/json; charset=utf-8');


$merchantKeyId = 'c57f917a-4808-4832-8b4d-c8aecb7c8a62';
$merchantSecretKey = '9CwHGnwdxMarmqxteqjFW2w85jpD6fuVdfMLVCiiQY8=';
$merchantId = 'test_test1111001';
global $SessionToken;
global $tokenizedCardId;




function logMessage($message)
{
    global $logFile;
    $time = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$time] $message\n", FILE_APPEND);
}

$logFile ='/home/polka9/visabest.tech/www/passkeyLOCKED/log9.log';
if (!is_dir(dirname($logFile))) {
    // Папка не існує
    error_log('Log dir missing: ' . dirname($logFile));
} elseif (!is_writable(dirname($logFile))) {
    // Немає прав на директорію
    error_log('Log dir not writable: ' . dirname($logFile));
}

// 1) Читаємо JSON від клієнта
$raw    = file_get_contents('php://input');
$client = json_decode($raw, true) ?: [];
// Мінімальна валідація/дефолти

$action = $client['orderInformation']['data']['action'];





//print_r($client);

$requestFile = __DIR__ . '/data.json';
$requestHost = 'apitest.cybersource.com';

// Завантажуємо запити
if (!file_exists($requestFile)) {
    die("Файл $requestFile не знайдено\n");
}
$json = file_get_contents($requestFile);
$requests = json_decode($json, true);
//print_r($requests);

if ($requests === null) {
    die("Не вдалося розпарсити $requestFile\n");
}









switch ($action) {
    case "authoptionsTMS":
        
        $guid=generateGUID();
        $_SESSION['$guid'] =$guid;
       
       
        
        $session = $client['orderInformation']['data']['sessionToken'];
        $_SESSION['$sessionToken'] =$session;
        $SessionToken=$session;
        $id = $client['orderInformation']['data']['TMStoken'];
     
        $_SESSION['$tokenizedCardId'] =$id;
        
       // echo "Create Tokenized Card Authentication Options";
        $payload=$requests['Authentication Options']['value'];
        $payload['sessionInformation']['secureToken']=$session;
        $payload['clientCorrelationId']=$guid;
         
      
        $newJson = json_encode( $payload,  JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        logMessage($newJson);
        $method="POST";
        $endpoint=$id."/authentication-options";
        
        authoptionsTMS($method,$endpoint,$newJson,$merchantKeyId, $merchantSecretKey,$merchantId);
        
        
        
        
        break;
    case "auth":
        
        
if (isset($client['orderInformation']['data']['ds'])) {
//3Ds scenario 


        $payload=$requests['Create Registration']['value'];
        $payload['sessionInformation']['secureToken']=$_SESSION['$sessionToken'];
        $payload['clientCorrelationId']=$_SESSION['$guid'];
        
        $newJson = json_encode( $payload,  JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        $method="POST";
        $endpoint=$_SESSION['$tokenizedCardId']."/authentication-registrations";
        
       authoptionsTMS($method,$endpoint,$newJson,$merchantKeyId, $merchantSecretKey,$merchantId);
  break;

} else {
    // OTP scenario
   
       $idotp= $client['orderInformation']['data']['authMethodId'];
       $payload=$requests['OTP Create']['value'];
       $payload['stepUpOption']['id']=$idotp;
       $payload['clientCorrelationId']= $_SESSION['$guid'];
       $_SESSION['authMethodId']=$idotp;
        $newJson = json_encode( $payload,  JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        $method="POST";
       
        $endpoint= $_SESSION['$tokenizedCardId']."/authentication-options/one-time-passwords";
       authoptionsTMS($method,$endpoint,$newJson,$merchantKeyId, $merchantSecretKey,$merchantId);
    $payload=$requests['OTP Create']['value'];
      
        break;
    
}
        
        
        
        
       
        
      
        
    case "otp":
        $otp= $client['orderInformation']['data']['otp'];
        $payload=$requests['Validate OTP']['value'];
        $payload['stepUpOption']['id']=$_SESSION['authMethodId'];
        $payload['clientCorrelationId']= $_SESSION['$guid'];
        $payload['otp']= $otp;
        
         $newJson = json_encode( $payload,  JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        $method="POST";
       
        $endpoint= $_SESSION['$tokenizedCardId']."/authentication-options/validate";
       authoptionsTMS($method,$endpoint,$newJson,$merchantKeyId, $merchantSecretKey,$merchantId);
       
        $payload=$requests['Create Registration']['value'];
        $payload['sessionInformation']['secureToken']=$_SESSION['$sessionToken'];
        $payload['clientCorrelationId']=$_SESSION['$guid'];
        
        $newJson = json_encode( $payload,  JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        $method="POST";
        $endpoint=$_SESSION['$tokenizedCardId']."/authentication-registrations";
        
       $rez=authoptionsTMS($method,$endpoint,$newJson,$merchantKeyId, $merchantSecretKey,$merchantId);
       
       break;
       
    case "GPC":
        
        $fidoBlob= $client['orderInformation']['data']['fidoBlob'];
        $idn= $client['orderInformation']['data']['idn'];
        $payload=$requests['Payment Credentials']['value'];
        
        //$payload['sessionInformation']['secureToken']=$_SESSION['$sessionToken'];
        $payload['clientCorrelationId']=$_SESSION['$guid'];
       // $payload['authenticatedIdentities']['id']=$idn;
      //   $payload['authenticatedIdentities']['data']=$fidoBlob;
         
         
         $payload['authenticatedIdentities'] = [[
    'id' => $idn,
    'data' => $fidoBlob,
    'provider' => 'VISA_PAYMENT_PASSKEY',
    'relyingPartyId' => 'dnRzLmF1dGgudmlzYS5jb20='
]];
         
         
         
         
        
        $newJson = json_encode( $payload,  JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        $method="POST";
        $endpoint=$_SESSION['$tokenizedCardId']."/payment-credentials";
        
       $rez=authoptionsTMSGPC($method,$endpoint,$newJson,$merchantKeyId, $merchantSecretKey,$merchantId);
        
        
        
        
        
        
        break;
   
    default:
        echo "Wrong case";
}



function authoptionsTMS ($method,$endpoint,$payload,$merchantKeyId, $merchantSecretKey,$merchantId){

logMessage($payload);
//$time = date('Y-m-d H:i:s');
//file_put_contents($logFile, "[$time] $payload\n", FILE_APPEND);
//echo ( $payload);



$requestHost = 'apitest.visaacceptance.com';
logMessage('https://' . $requestHost . '/tms/v2/tokenized-cards/'.$endpoint);

$signature = generateHttpSignature('post', '/tms/v2/tokenized-cards/'.$endpoint, $payload, $merchantKeyId, $merchantSecretKey, $requestHost, $merchantId);

$ch = curl_init('https://' . $requestHost . '/tms/v2/tokenized-cards/'.$endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_VERBOSE, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json;charset=utf-8',
    'v-c-merchant-id: ' . $merchantId,
    'Date: ' . gmdate('D, d M Y H:i:s T'),
    'Host: ' . $requestHost,
    'Signature: ' . $signature,
    'Digest: ' . 'SHA-256=' . base64_encode(hash('sha256', $payload, true)),
    'User-Agent: Mozilla/5.0'
]);






$response = curl_exec($ch);
curl_close($ch);
logMessage($response);

$array1 = json_decode($payload, true); // Декодируем в массив
$array2 = json_decode($response, true);
$merged_array = array_merge($array1, $array2);
$final_json_output = json_encode($merged_array);


echo ($final_json_output);

    
}



function authoptionsTMSGPC ($method,$endpoint,$payload,$merchantKeyId, $merchantSecretKey,$merchantId){

logMessage($payload);
//$time = date('Y-m-d H:i:s');
//file_put_contents($logFile, "[$time] $payload\n", FILE_APPEND);
//echo ( $payload);



$requestHost = 'apitest.visaacceptance.com';
logMessage('https://' . $requestHost . '/tms/v2/tokens/'.$endpoint);

$signature = generateHttpSignature('post', '/tms/v2/tokens/'.$endpoint, $payload, $merchantKeyId, $merchantSecretKey, $requestHost, $merchantId);

$ch = curl_init('https://' . $requestHost . '/tms/v2/tokens/'.$endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_VERBOSE, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json;charset=utf-8',
    'v-c-merchant-id: ' . $merchantId,
    'Date: ' . gmdate('D, d M Y H:i:s T'),
    'Host: ' . $requestHost,
    'Signature: ' . $signature,
    'Digest: ' . 'SHA-256=' . base64_encode(hash('sha256', $payload, true)),
    'User-Agent: Mozilla/5.0'
]);






$response = curl_exec($ch);
curl_close($ch);
logMessage($response);

$array1 = json_decode($payload, true); // Декодируем в массив

$array2 = [
    'value' => $response,
    'description' => 'MLE decoded message with network token '
];




$merged_array = array_merge($array1, $array2);
$final_json_output = json_encode($merged_array);


echo ($final_json_output);

    
}









function authOTP ($method,$endpoint,$payload,$merchantKeyId, $merchantSecretKey,$merchantId){

logMessage($payload);
//$time = date('Y-m-d H:i:s');
//file_put_contents($logFile, "[$time] $payload\n", FILE_APPEND);
//echo ( $payload);



$requestHost = 'apitest.visaacceptance.com';
logMessage('https://' . $requestHost . '/tms/v2/tokenized-cards/'.$endpoint);

$signature = generateHttpSignature('post', '/tms/v2/tokenized-cards/'.$endpoint, $payload, $merchantKeyId, $merchantSecretKey, $requestHost, $merchantId);

$ch = curl_init('https://' . $requestHost . '/tms/v2/tokenized-cards/'.$endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_VERBOSE, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json;charset=utf-8',
    'v-c-merchant-id: ' . $merchantId,
    'Date: ' . gmdate('D, d M Y H:i:s T'),
    'Host: ' . $requestHost,
    'Signature: ' . $signature,
    'Digest: ' . 'SHA-256=' . base64_encode(hash('sha256', $payload, true)),
    'User-Agent: Mozilla/5.0'
]);






$response = curl_exec($ch);
curl_close($ch);
logMessage($response);

$array1 = json_decode($payload, true); // Декодируем в массив
$array2 = json_decode($response, true);
$merged_array = array_merge($array1, $array2);
$final_json_output = json_encode($merged_array);


echo ($final_json_output);

    
}











function generateGUID() {
    // Generate 16 bytes (128 bits) of random data
    $data = openssl_random_pseudo_bytes(16);

    // Set version to 4 (random)
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    // Set bits 6-7 to 10
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

    // Output the 36-character UUID string
    return sprintf(
        '%s-%s-%s-%s-%s',
        bin2hex(substr($data, 0, 4)),
        bin2hex(substr($data, 4, 2)),
        bin2hex(substr($data, 6, 2)),
        bin2hex(substr($data, 8, 2)),
        bin2hex(substr($data, 10, 6))
    );
}























function generateHttpSignature($method, $resource, $payload, $merchantKeyId, $merchantSecretKey, $requestHost, $merchantId) {
    $date = gmdate('D, d M Y H:i:s T');
    $digest = 'SHA-256=' . base64_encode(hash('sha256', $payload, true));

    $signatureString = "host: $requestHost\n";
    $signatureString .= "date: $date\n";




    $signatureString .= "request-target: $method $resource\n";
    $signatureString .= "digest: $digest\n";
    $signatureString .= "v-c-merchant-id: $merchantId";

    $signature = hash_hmac('sha256', $signatureString, base64_decode($merchantSecretKey), true);
    $signature = base64_encode($signature);

    return "keyid=\"$merchantKeyId\", algorithm=\"HmacSHA256\", headers=\"host date request-target digest v-c-merchant-id\", signature=\"$signature\"";
}

