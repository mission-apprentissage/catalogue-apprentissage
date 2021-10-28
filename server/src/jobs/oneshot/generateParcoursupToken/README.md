# Création de token pour le WS Parcoursup

##tl;dr
Générer un token valide 2h :

```shell
$> dotenv yarn psup:token -- -t 7200000
```

## Création des clés

### Clé RSA

```shell
$> ssh-keygen -t rsa
```

Va générer une clé privée et une clé publique (sans mot de passe).
La clé privée peut être utiliser pour générer un token JWT.

### Clé publique PEM

```shell
$> ssh-keygen -f id_rsa_dev_ps.pub -m 'PEM' -e > id_rsa_dev_ps_pub.pem
```

La clé publique PEM peut être utiliser pour vérifier un token JWT généré avec la clé privée.

## Exemple d'implémentation chez PS

```java
public static String genererTokenValide(String id,int delay,String obj) throws JOSEException {
    JWK jwk = JWK.parseFromPEMEncodedObjects(pemEncodedRSAPrivateKey);
    JWSSigner signer = new RSASSASigner(jwk.toRSAKey());
    String objetASigner=obj;//"{\"type_de_formation\":\"string\",\"specialite\":\"string\",\"rncp\":\"string\",\"cfd\":\"string\",\"mef\":\"string\",\"uai\":\"string\"}";


    JSONObject json=new JSONObject();
    Long now=System.currentTimeMillis();
    json.put("id", id);
    json.put("expire", now+delay);
    if(objetASigner!=null) {
    objetASigner=Hashing.sha512().hashString(objetASigner, StandardCharsets.UTF_8).toString();
    json.put("hash", objetASigner);
    }

    Payload payload=new Payload(json);
    JWSObject jwsObject = new JWSObject(
            new JWSHeader.Builder(JWSAlgorithm.RS512).keyID(jwk.getKeyID()).build(),payload);

    jwsObject.sign(signer);
    return jwsObject.serialize();
}
```
